import { Satellite, GroundStation, Constellation, CommunicationLink, DashboardStats } from '../types';

export const constellations: Constellation[] = [
  {
    id: 'gps',
    name: 'GPS',
    description: 'Global Positioning System - US military navigation constellation',
    color: '#4a9eff',
    satelliteCount: 31,
    orbitType: 'MEO',
    purpose: 'Navigation & Timing'
  },
  {
    id: 'starlink',
    name: 'Starlink',
    description: 'SpaceX broadband internet constellation',
    color: '#00ffff',
    satelliteCount: 5000,
    orbitType: 'LEO',
    purpose: 'Broadband Internet'
  },
  {
    id: 'sbirs',
    name: 'SBIRS',
    description: 'Space-Based Infrared System - Missile warning',
    color: '#ff3366',
    satelliteCount: 6,
    orbitType: 'GEO',
    purpose: 'Missile Warning'
  },
  {
    id: 'wgs',
    name: 'WGS',
    description: 'Wideband Global SATCOM - Military communications',
    color: '#00ff88',
    satelliteCount: 10,
    orbitType: 'GEO',
    purpose: 'Military Communications'
  },
  {
    id: 'nro',
    name: 'NRO Reconnaissance',
    description: 'National Reconnaissance Office imaging satellites',
    color: '#9d4edd',
    satelliteCount: 8,
    orbitType: 'LEO',
    purpose: 'Intelligence & Surveillance'
  }
];

// Generate satellites for each constellation
const generateSatellites = (): Satellite[] => {
  const satellites: Satellite[] = [];
  let id = 1;

  // GPS Satellites (MEO - ~20,200 km)
  for (let i = 0; i < 24; i++) {
    const plane = Math.floor(i / 4);
    const slot = i % 4;
    satellites.push({
      id: `SAT-${String(id++).padStart(4, '0')}`,
      name: `GPS IIF-${i + 1}`,
      constellation: 'gps',
      type: 'navigation',
      orbitType: 'MEO',
      altitude: 20200,
      inclination: 55,
      period: 718,
      status: Math.random() > 0.1 ? 'operational' : 'degraded',
      launchDate: new Date(2010 + Math.floor(i / 3), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      position: {
        lat: (Math.random() - 0.5) * 110,
        lng: (plane * 60) + (slot * 15) + Math.random() * 10,
        alt: 20200
      },
      velocity: 3.87
    });
  }

  // Starlink Satellites (LEO - ~550 km) - Sample of 50
  for (let i = 0; i < 50; i++) {
    satellites.push({
      id: `SAT-${String(id++).padStart(4, '0')}`,
      name: `Starlink-${1000 + i}`,
      constellation: 'starlink',
      type: 'communication',
      orbitType: 'LEO',
      altitude: 550,
      inclination: 53,
      period: 95,
      status: Math.random() > 0.05 ? 'operational' : (Math.random() > 0.5 ? 'degraded' : 'offline'),
      launchDate: new Date(2020 + Math.floor(i / 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      position: {
        lat: (Math.random() - 0.5) * 106,
        lng: (Math.random() - 0.5) * 360,
        alt: 550
      },
      velocity: 7.66
    });
  }

  // SBIRS Satellites (GEO - ~35,786 km)
  const sbirsPositions = [-135, -90, -45, 0, 45, 90];
  for (let i = 0; i < 6; i++) {
    satellites.push({
      id: `SAT-${String(id++).padStart(4, '0')}`,
      name: `SBIRS-GEO-${i + 1}`,
      constellation: 'sbirs',
      type: 'military',
      orbitType: 'GEO',
      altitude: 35786,
      inclination: 0,
      period: 1436,
      status: 'operational',
      launchDate: new Date(2011 + i * 2, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      position: {
        lat: 0,
        lng: sbirsPositions[i],
        alt: 35786
      },
      velocity: 3.07
    });
  }

  // WGS Satellites (GEO)
  const wgsPositions = [-178, -135, -92, -52, 12, 60, 84, 143, 172, -12];
  for (let i = 0; i < 10; i++) {
    satellites.push({
      id: `SAT-${String(id++).padStart(4, '0')}`,
      name: `WGS-${i + 1}`,
      constellation: 'wgs',
      type: 'communication',
      orbitType: 'GEO',
      altitude: 35786,
      inclination: 0,
      period: 1436,
      status: 'operational',
      launchDate: new Date(2007 + i, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      position: {
        lat: 0,
        lng: wgsPositions[i],
        alt: 35786
      },
      velocity: 3.07
    });
  }

  // NRO Reconnaissance Satellites (LEO - various altitudes)
  for (let i = 0; i < 8; i++) {
    satellites.push({
      id: `SAT-${String(id++).padStart(4, '0')}`,
      name: `USA-${280 + i}`,
      constellation: 'nro',
      type: 'reconnaissance',
      orbitType: 'LEO',
      altitude: 250 + Math.random() * 300,
      inclination: 97 + Math.random() * 6,
      period: 90 + Math.random() * 10,
      status: 'operational',
      launchDate: new Date(2015 + Math.floor(i / 2), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      position: {
        lat: (Math.random() - 0.5) * 180,
        lng: (Math.random() - 0.5) * 360,
        alt: 250 + Math.random() * 300
      },
      velocity: 7.8
    });
  }

  return satellites;
};

export const satellites = generateSatellites();

export const groundStations: GroundStation[] = [
  {
    id: 'GS-001',
    name: 'Schriever AFB',
    location: { lat: 38.8, lng: -104.5 },
    type: 'both',
    status: 'online',
    connectedSatellites: ['SAT-0001', 'SAT-0002', 'SAT-0003']
  },
  {
    id: 'GS-002',
    name: 'Diego Garcia',
    location: { lat: -7.3, lng: 72.4 },
    type: 'both',
    status: 'online',
    connectedSatellites: ['SAT-0004', 'SAT-0005']
  },
  {
    id: 'GS-003',
    name: 'Kwajalein',
    location: { lat: 9.0, lng: 167.7 },
    type: 'both',
    status: 'online',
    connectedSatellites: ['SAT-0006', 'SAT-0007']
  },
  {
    id: 'GS-004',
    name: 'Ascension Island',
    location: { lat: -7.9, lng: -14.4 },
    type: 'both',
    status: 'online',
    connectedSatellites: ['SAT-0008']
  },
  {
    id: 'GS-005',
    name: 'Cape Canaveral',
    location: { lat: 28.5, lng: -80.6 },
    type: 'both',
    status: 'online',
    connectedSatellites: ['SAT-0010', 'SAT-0011']
  },
  {
    id: 'GS-006',
    name: 'Vandenberg SFB',
    location: { lat: 34.7, lng: -120.6 },
    type: 'both',
    status: 'online',
    connectedSatellites: ['SAT-0012', 'SAT-0013']
  },
  {
    id: 'GS-007',
    name: 'Pine Gap',
    location: { lat: -23.8, lng: 133.7 },
    type: 'downlink',
    status: 'online',
    connectedSatellites: ['SAT-0075', 'SAT-0076']
  },
  {
    id: 'GS-008',
    name: 'Buckley SFB',
    location: { lat: 39.7, lng: -104.8 },
    type: 'downlink',
    status: 'maintenance',
    connectedSatellites: []
  }
];

export const communicationLinks: CommunicationLink[] = [
  {
    id: 'LINK-001',
    fromId: 'SAT-0001',
    toId: 'GS-001',
    type: 'satellite-ground',
    signalStrength: 95,
    latency: 120,
    bandwidth: 1200,
    status: 'active'
  },
  {
    id: 'LINK-002',
    fromId: 'SAT-0025',
    toId: 'SAT-0026',
    type: 'inter-satellite',
    signalStrength: 88,
    latency: 5,
    bandwidth: 10000,
    status: 'active'
  },
  {
    id: 'LINK-003',
    fromId: 'SAT-0075',
    toId: 'GS-007',
    type: 'satellite-ground',
    signalStrength: 72,
    latency: 45,
    bandwidth: 5000,
    status: 'degraded'
  }
];

export const dashboardStats: DashboardStats = {
  totalSatellites: satellites.length,
  operationalSatellites: satellites.filter(s => s.status === 'operational').length,
  groundStations: groundStations.filter(gs => gs.status === 'online').length,
  activeLinks: communicationLinks.filter(l => l.status === 'active').length,
  globalCoverage: 94.7,
  averageLatency: 45
};
