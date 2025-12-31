# Real Data Integration Guide - Satellite Constellation Visualizer

## Overview
This guide explains how to integrate real satellite tracking data into the visualizer for production use with actual orbital data.

---

## 1. Space-Track.org (NORAD TLE Data)

### Registration & API Access
1. Register at [Space-Track.org](https://www.space-track.org) (requires .gov/.mil/.edu or approved organization)
2. Obtain API credentials

### TLE Data Fetching
```typescript
// src/services/spaceTrackApi.ts
const SPACE_TRACK_API = 'https://www.space-track.org';

interface TLE {
  NORAD_CAT_ID: string;
  OBJECT_NAME: string;
  TLE_LINE1: string;
  TLE_LINE2: string;
  EPOCH: string;
}

export async function login(username: string, password: string): Promise<string> {
  const response = await fetch(`${SPACE_TRACK_API}/ajaxauth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `identity=${username}&password=${password}`
  });
  const cookies = response.headers.get('set-cookie');
  return cookies || '';
}

export async function fetchTLEs(sessionCookie: string, noradIds: string[]): Promise<TLE[]> {
  const ids = noradIds.join(',');
  const response = await fetch(
    `${SPACE_TRACK_API}/basicspacedata/query/class/tle_latest/NORAD_CAT_ID/${ids}/orderby/EPOCH%20desc/limit/1/format/json`,
    { headers: { Cookie: sessionCookie } }
  );
  return response.json();
}

// Fetch entire constellation
export async function fetchConstellationTLEs(
  sessionCookie: string,
  constellation: 'starlink' | 'gps' | 'oneweb'
): Promise<TLE[]> {
  const queries: Record<string, string> = {
    starlink: 'OBJECT_NAME/STARLINK~~/orderby/EPOCH%20desc',
    gps: 'OBJECT_NAME/GPS~~/orderby/EPOCH%20desc',
    oneweb: 'OBJECT_NAME/ONEWEB~~/orderby/EPOCH%20desc'
  };

  const response = await fetch(
    `${SPACE_TRACK_API}/basicspacedata/query/class/tle_latest/${queries[constellation]}/format/json`,
    { headers: { Cookie: sessionCookie } }
  );
  return response.json();
}
```

---

## 2. Satellite.js for Orbital Propagation

### Installation
```bash
npm install satellite.js
```

### TLE to Position Calculation
```typescript
// src/utils/orbitalMechanics.ts
import * as satellite from 'satellite.js';

interface SatellitePosition {
  lat: number;
  lng: number;
  altitude: number;
  velocity: number;
}

export function propagateTLE(tle1: string, tle2: string, date: Date = new Date()): SatellitePosition {
  // Parse TLE
  const satrec = satellite.twoline2satrec(tle1, tle2);

  // Propagate to current time
  const positionAndVelocity = satellite.propagate(satrec, date);

  if (typeof positionAndVelocity.position === 'boolean') {
    throw new Error('Propagation failed');
  }

  // Convert ECI to geodetic coordinates
  const gmst = satellite.gstime(date);
  const position = positionAndVelocity.position as satellite.EciVec3<number>;
  const velocity = positionAndVelocity.velocity as satellite.EciVec3<number>;

  const geodetic = satellite.eciToGeodetic(position, gmst);

  // Calculate velocity magnitude (km/s)
  const velocityMag = Math.sqrt(
    velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2
  );

  return {
    lat: satellite.degreesLat(geodetic.latitude),
    lng: satellite.degreesLong(geodetic.longitude),
    altitude: geodetic.height,
    velocity: velocityMag
  };
}

// Generate orbit path points
export function generateOrbitPath(tle1: string, tle2: string, points: number = 360): SatellitePosition[] {
  const satrec = satellite.twoline2satrec(tle1, tle2);
  const period = (2 * Math.PI) / satrec.no; // Orbital period in minutes

  const path: SatellitePosition[] = [];
  const now = new Date();

  for (let i = 0; i < points; i++) {
    const time = new Date(now.getTime() + (i / points) * period * 60 * 1000);
    try {
      path.push(propagateTLE(tle1, tle2, time));
    } catch (e) {
      // Skip invalid propagation points
    }
  }

  return path;
}
```

---

## 3. CelesTrak API (Public TLE Source)

### No Authentication Required
```typescript
// src/services/celestrakApi.ts
const CELESTRAK_API = 'https://celestrak.org/NORAD/elements/gp.php';

export async function fetchGPSConstellation(): Promise<string> {
  const response = await fetch(`${CELESTRAK_API}?GROUP=gps-ops&FORMAT=tle`);
  return response.text();
}

export async function fetchStarlinkConstellation(): Promise<string> {
  const response = await fetch(`${CELESTRAK_API}?GROUP=starlink&FORMAT=tle`);
  return response.text();
}

export async function fetchMilitarySatellites(): Promise<string> {
  const response = await fetch(`${CELESTRAK_API}?GROUP=military&FORMAT=tle`);
  return response.text();
}

// Parse TLE text into structured data
export function parseTLEText(tleText: string): Array<{name: string, tle1: string, tle2: string}> {
  const lines = tleText.trim().split('\n');
  const satellites = [];

  for (let i = 0; i < lines.length; i += 3) {
    satellites.push({
      name: lines[i].trim(),
      tle1: lines[i + 1],
      tle2: lines[i + 2]
    });
  }

  return satellites;
}
```

---

## 4. N2YO API (Real-Time Tracking)

### API Registration
Register at [N2YO.com](https://www.n2yo.com/api/) for free API key

```typescript
// src/services/n2yoApi.ts
const N2YO_API = 'https://api.n2yo.com/rest/v1/satellite';

interface SatellitePass {
  startTime: Date;
  endTime: Date;
  maxElevation: number;
  startAzimuth: number;
  endAzimuth: number;
}

export async function getSatellitePosition(noradId: number, apiKey: string) {
  const response = await fetch(
    `${N2YO_API}/positions/${noradId}/41.702/-76.014/0/1/&apiKey=${apiKey}`
  );
  return response.json();
}

export async function getVisualPasses(
  noradId: number,
  lat: number,
  lng: number,
  apiKey: string
): Promise<SatellitePass[]> {
  const response = await fetch(
    `${N2YO_API}/visualpasses/${noradId}/${lat}/${lng}/0/7/300/&apiKey=${apiKey}`
  );
  const data = await response.json();
  return data.passes;
}

export async function getRadioPasses(
  noradId: number,
  lat: number,
  lng: number,
  apiKey: string
) {
  const response = await fetch(
    `${N2YO_API}/radiopasses/${noradId}/${lat}/${lng}/0/7/40/&apiKey=${apiKey}`
  );
  return response.json();
}
```

---

## 5. Real-Time Updates with WebSocket

### Server-Side Propagation Service
```typescript
// src/services/satelliteServer.ts
import { WebSocketServer } from 'ws';
import * as satellite from 'satellite.js';

const wss = new WebSocketServer({ port: 8081 });

// Store TLE data for all tracked satellites
const satellites = new Map<string, { tle1: string; tle2: string }>();

// Broadcast positions every second
setInterval(() => {
  const positions = new Map<string, any>();
  const now = new Date();

  satellites.forEach((tle, id) => {
    const satrec = satellite.twoline2satrec(tle.tle1, tle.tle2);
    const positionAndVelocity = satellite.propagate(satrec, now);

    if (typeof positionAndVelocity.position !== 'boolean') {
      const gmst = satellite.gstime(now);
      const geodetic = satellite.eciToGeodetic(
        positionAndVelocity.position as satellite.EciVec3<number>,
        gmst
      );

      positions.set(id, {
        lat: satellite.degreesLat(geodetic.latitude),
        lng: satellite.degreesLong(geodetic.longitude),
        alt: geodetic.height
      });
    }
  });

  const message = JSON.stringify({
    type: 'POSITION_UPDATE',
    timestamp: now.toISOString(),
    satellites: Object.fromEntries(positions)
  });

  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}, 1000);
```

### Client-Side WebSocket Hook
```typescript
// src/hooks/useSatellitePositions.ts
import { useState, useEffect } from 'react';

export function useSatellitePositions(wsUrl: string) {
  const [positions, setPositions] = useState<Map<string, Position>>(new Map());

  useEffect(() => {
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'POSITION_UPDATE') {
        setPositions(new Map(Object.entries(data.satellites)));
      }
    };

    return () => ws.close();
  }, [wsUrl]);

  return positions;
}
```

---

## 6. Defense Satellite Tracking (SSA Data)

### 18th Space Defense Squadron Integration
```typescript
// src/services/spaceDefenseApi.ts
// Note: Requires proper authorization for classified data

interface SpaceObject {
  catalogNumber: string;
  name: string;
  country: string;
  launchDate: Date;
  orbitType: 'LEO' | 'MEO' | 'GEO' | 'HEO';
  status: 'active' | 'debris' | 'inactive';
}

export async function fetchSpaceCatalog(authToken: string): Promise<SpaceObject[]> {
  const response = await fetch('https://api.space-track.org/catalog', {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  return response.json();
}

// Track conjunction events (potential collisions)
export async function fetchConjunctionEvents(authToken: string) {
  const response = await fetch(
    'https://api.space-track.org/cdm_public',
    { headers: { Authorization: `Bearer ${authToken}` } }
  );
  return response.json();
}
```

---

## 7. NORAD Catalog IDs for Major Constellations

```typescript
// src/data/constellationCatalogIds.ts
export const CONSTELLATION_NORAD_IDS = {
  // GPS Block III
  GPS: [
    48859, 46826, 45854, 44506, 43873, 41328, 40730, 40534, 40294, 40105,
    39741, 39533, 39166, 38833, 37753, 36585, 35752, 32711, 32384, 32260,
    29601, 28874, 28474, 28190, 27704, 27663, 26605, 26360, 25933, 24876
  ],

  // Starlink (sample - there are 5000+)
  STARLINK_SAMPLE: [
    44713, 44714, 44715, 44716, 44717, 44718, 44719, 44720,
    // ... add more as needed
  ],

  // SBIRS (Space Based Infrared System)
  SBIRS: [37481, 38995, 42920, 44831, 49518],

  // WGS (Wideband Global SATCOM)
  WGS: [32258, 34713, 36108, 38070, 39168, 40746, 42075, 44478, 48234],

  // Iridium NEXT
  IRIDIUM: [
    43039, 43040, 43041, 43042, 43043, 43044, 43045, 43046, 43047, 43048,
    43249, 43250, 43251, 43252, 43253, 43254, 43255, 43256, 43257, 43258
  ],

  // ISS
  ISS: [25544]
};
```

---

## 8. Environment Variables

```env
# .env.local

# Space-Track.org credentials
SPACE_TRACK_USER=your-username
SPACE_TRACK_PASS=your-password

# N2YO API
N2YO_API_KEY=your-api-key

# WebSocket server
WS_SERVER_PORT=8081

# Update intervals (ms)
TLE_REFRESH_INTERVAL=3600000  # 1 hour
POSITION_UPDATE_INTERVAL=1000  # 1 second
```

---

## 9. Complete Integration Example

```typescript
// src/App.tsx integration
import { useEffect, useState } from 'react';
import { fetchGPSConstellation, parseTLEText } from './services/celestrakApi';
import { propagateTLE } from './utils/orbitalMechanics';
import { Satellite } from './types';

function App() {
  const [satellites, setSatellites] = useState<Satellite[]>([]);

  useEffect(() => {
    async function loadRealData() {
      // Fetch real TLE data
      const tleText = await fetchGPSConstellation();
      const tleData = parseTLEText(tleText);

      // Propagate to current positions
      const realSatellites = tleData.map((tle, index) => {
        const position = propagateTLE(tle.tle1, tle.tle2);
        return {
          id: `GPS-${index + 1}`,
          name: tle.name,
          constellation: 'gps',
          position: { lat: position.lat, lng: position.lng },
          altitude: position.altitude,
          velocity: position.velocity,
          orbitType: 'MEO',
          inclination: 55,
          period: 718, // ~12 hours
          status: 'operational',
          launchDate: new Date()
        };
      });

      setSatellites(realSatellites);
    }

    loadRealData();

    // Update positions every second
    const interval = setInterval(() => {
      setSatellites(prev => prev.map(sat => ({
        ...sat,
        position: propagateTLE(sat.tle1, sat.tle2)
      })));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (/* ... */);
}
```

---

## Recommended Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  TLE Sources    │     │   Backend    │     │   Frontend      │
│  - Space-Track  │────▶│   (Node.js)  │────▶│   (React +      │
│  - CelesTrak    │     │              │     │    Three.js)    │
│  - N2YO         │     │  - TLE Cache │     │                 │
└─────────────────┘     │  - SGP4 Prop │     │  - 3D Globe     │
                        │  - WebSocket │     │  - Real-time    │
                        │              │     │    positions    │
                        └──────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │   Redis      │
                        │   (Cache)    │
                        └──────────────┘
```

---

## Performance Considerations

1. **TLE Caching**: TLEs are valid for ~2 weeks, cache and refresh every few hours
2. **Server-Side Propagation**: Propagate positions on server, send only results to clients
3. **WebSocket Throttling**: 1 Hz updates for real-time, 0.1 Hz for overview
4. **Constellation Filtering**: Only propagate visible satellites based on user selection
5. **Level of Detail**: Reduce orbit point density for distant zoom levels

---

## Getting Started

1. Sign up for Space-Track.org account (or use CelesTrak for public data)
2. Install satellite.js: `npm install satellite.js`
3. Implement TLE fetching service
4. Set up position propagation loop
5. Connect to React state management
6. Test with GPS constellation (reliable, well-documented)
