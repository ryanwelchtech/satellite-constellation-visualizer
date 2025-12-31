export interface Satellite {
  id: string;
  name: string;
  constellation: string;
  type: 'communication' | 'navigation' | 'reconnaissance' | 'weather' | 'military';
  orbitType: 'LEO' | 'MEO' | 'GEO' | 'HEO';
  altitude: number; // km
  inclination: number; // degrees
  period: number; // minutes
  status: 'operational' | 'degraded' | 'offline';
  launchDate: Date;
  position: {
    lat: number;
    lng: number;
    alt: number;
  };
  velocity: number; // km/s
}

export interface GroundStation {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  type: 'uplink' | 'downlink' | 'both';
  status: 'online' | 'offline' | 'maintenance';
  connectedSatellites: string[];
}

export interface Constellation {
  id: string;
  name: string;
  description: string;
  color: string;
  satelliteCount: number;
  orbitType: 'LEO' | 'MEO' | 'GEO' | 'HEO';
  purpose: string;
}

export interface CommunicationLink {
  id: string;
  fromId: string;
  toId: string;
  type: 'satellite-ground' | 'inter-satellite';
  signalStrength: number; // percentage
  latency: number; // ms
  bandwidth: number; // Mbps
  status: 'active' | 'degraded' | 'inactive';
}

export interface DashboardStats {
  totalSatellites: number;
  operationalSatellites: number;
  groundStations: number;
  activeLinks: number;
  globalCoverage: number;
  averageLatency: number;
}
