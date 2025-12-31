import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import StatsPanel from './components/StatsPanel';
import ConstellationPanel from './components/ConstellationPanel';
import SatelliteInfo from './components/SatelliteInfo';
import Scene from './components/Scene';
import DataSourceControls from './components/DataSourceControls';
import { satellites as mockSatellites, groundStations, constellations as mockConstellations, dashboardStats as mockStats } from './data/satellites';
import { Satellite, Constellation, DashboardStats } from './types';
import { celestrakApi, CONSTELLATION_GROUPS, ConstellationGroup } from './services/celestrakApi';

// Map CelesTrak groups to constellation configs
const CELESTRAK_CONSTELLATION_CONFIG: Record<ConstellationGroup, { color: string; description: string; purpose: string }> = {
  GPS: { color: '#4a9eff', description: 'US Global Positioning System - Navigation constellation', purpose: 'Navigation & Timing' },
  GLONASS: { color: '#ff6b6b', description: 'Russian Global Navigation Satellite System', purpose: 'Navigation & Timing' },
  GALILEO: { color: '#ffd43b', description: 'European Global Navigation Satellite System', purpose: 'Navigation & Timing' },
  BEIDOU: { color: '#ff922b', description: 'Chinese Navigation Satellite System', purpose: 'Navigation & Timing' },
  STARLINK: { color: '#00ffff', description: 'SpaceX broadband internet mega-constellation', purpose: 'Broadband Internet' },
  ONEWEB: { color: '#845ef7', description: 'OneWeb global internet constellation', purpose: 'Broadband Internet' },
  IRIDIUM: { color: '#20c997', description: 'Iridium NEXT satellite phone constellation', purpose: 'Mobile Communications' },
  WEATHER: { color: '#74c0fc', description: 'Meteorological observation satellites', purpose: 'Weather Monitoring' },
  NOAA: { color: '#63e6be', description: 'NOAA environmental monitoring satellites', purpose: 'Environmental Monitoring' },
  GEO: { color: '#fcc419', description: 'Geostationary communications satellites', purpose: 'Communications' },
  INTELSAT: { color: '#f783ac', description: 'Intelsat commercial communications fleet', purpose: 'Commercial Communications' },
  SES: { color: '#da77f2', description: 'SES global satellite fleet', purpose: 'Commercial Communications' },
  ISS: { color: '#ff3366', description: 'International Space Station and crew vehicles', purpose: 'Space Station' },
  MILITARY: { color: '#868e96', description: 'Military satellites (unclassified)', purpose: 'Military Operations' },
  SCIENCE: { color: '#94d82d', description: 'Scientific research satellites', purpose: 'Scientific Research' },
  EARTH_RESOURCES: { color: '#22b8cf', description: 'Earth observation and resource monitoring', purpose: 'Earth Observation' },
};

function App() {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [satellites, setSatellites] = useState<Satellite[]>(mockSatellites);
  const [constellations, setConstellations] = useState<Constellation[]>(mockConstellations);
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [visibleConstellations, setVisibleConstellations] = useState<string[]>(
    mockConstellations.map(c => c.id)
  );
  const [selectedConstellation, setSelectedConstellation] = useState<string | null>(null);
  const [selectedSatellite, setSelectedSatellite] = useState<Satellite | null>(null);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [dataSource, setDataSource] = useState<'mock' | 'celestrak'>('mock');
  const [liveDataCount, setLiveDataCount] = useState(0);

  const handleToggleConstellation = (id: string) => {
    setVisibleConstellations(prev =>
      prev.includes(id)
        ? prev.filter(c => c !== id)
        : [...prev, id]
    );
  };

  const handleSelectConstellation = (id: string | null) => {
    setSelectedConstellation(id);
    if (id) {
      // Ensure constellation is visible when selected
      if (!visibleConstellations.includes(id)) {
        setVisibleConstellations(prev => [...prev, id]);
      }
    }
  };

  // Fetch live satellite data from CelesTrak
  const fetchLiveData = useCallback(async () => {
    setIsLoadingLive(true);
    try {
      // Fetch select constellations (GPS, Starlink sample, ISS, Iridium)
      const groupsToFetch: ConstellationGroup[] = ['GPS', 'ISS', 'IRIDIUM', 'GALILEO', 'GLONASS'];
      const results = await celestrakApi.fetchMultipleConstellations(groupsToFetch);

      const newSatellites: Satellite[] = [];
      const newConstellations: Constellation[] = [];
      let satId = 1;

      results.forEach((tleData, group) => {
        const config = CELESTRAK_CONSTELLATION_CONFIG[group];
        const groupId = group.toLowerCase();

        // Create constellation entry
        newConstellations.push({
          id: groupId,
          name: group,
          description: config.description,
          color: config.color,
          satelliteCount: tleData.length,
          orbitType: celestrakApi.getOrbitType(
            tleData.length > 0
              ? celestrakApi.estimateAltitude(celestrakApi.parseTLEDetails(tleData[0]).meanMotion)
              : 500
          ),
          purpose: config.purpose,
        });

        // Convert TLE data to satellites
        tleData.forEach((tle) => {
          const parsed = celestrakApi.parseTLEDetails(tle);
          const altitude = celestrakApi.estimateAltitude(parsed.meanMotion);
          const period = celestrakApi.calculateOrbitalPeriod(parsed.meanMotion);
          const orbitType = celestrakApi.getOrbitType(altitude);

          // Generate approximate position from mean anomaly and RAAN
          const lat = parsed.inclination * Math.sin((parsed.meanAnomaly * Math.PI) / 180) * (Math.random() > 0.5 ? 1 : -1);
          const lng = (parsed.raan + parsed.meanAnomaly) % 360 - 180;

          newSatellites.push({
            id: `LIVE-${tle.noradId}`,
            name: tle.name,
            constellation: groupId,
            type: group === 'GPS' || group === 'GLONASS' || group === 'GALILEO' ? 'navigation'
                : group === 'ISS' ? 'military'
                : 'communication',
            orbitType,
            altitude: Math.round(altitude),
            inclination: parsed.inclination,
            period: Math.round(period),
            status: 'operational',
            launchDate: new Date(2000 + parsed.launchYear, 0, 1),
            position: {
              lat: Math.max(-90, Math.min(90, lat)),
              lng,
              alt: altitude,
            },
            velocity: orbitType === 'LEO' ? 7.66 : orbitType === 'MEO' ? 3.87 : 3.07,
          });
          satId++;
        });
      });

      setSatellites(newSatellites);
      setConstellations(newConstellations);
      setVisibleConstellations(newConstellations.map(c => c.id));
      setDataSource('celestrak');
      setLiveDataCount(newSatellites.length);

      // Update stats
      setStats({
        totalSatellites: newSatellites.length,
        operationalSatellites: newSatellites.filter(s => s.status === 'operational').length,
        groundStations: groundStations.filter(gs => gs.status === 'online').length,
        activeLinks: 2,
        globalCoverage: 94.7,
        averageLatency: 45,
      });

    } catch (error) {
      console.error('Failed to fetch CelesTrak data:', error);
    } finally {
      setIsLoadingLive(false);
    }
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden star-field">
      <Header
        onTogglePanel={() => setIsPanelOpen(!isPanelOpen)}
        isPanelOpen={isPanelOpen}
      />

      {/* 3D Scene */}
      <div className="absolute inset-0">
        <Scene
          satellites={satellites}
          groundStations={groundStations}
          visibleConstellations={visibleConstellations}
          selectedSatellite={selectedSatellite}
          onSelectSatellite={setSelectedSatellite}
        />
      </div>

      {/* Stats Panel */}
      <StatsPanel stats={stats} />

      {/* Constellation Panel */}
      {isPanelOpen && (
        <ConstellationPanel
          constellations={constellations}
          visibleConstellations={visibleConstellations}
          onToggleConstellation={handleToggleConstellation}
          selectedConstellation={selectedConstellation}
          onSelectConstellation={handleSelectConstellation}
        />
      )}

      {/* Satellite Info */}
      <SatelliteInfo
        satellite={selectedSatellite}
        onClose={() => setSelectedSatellite(null)}
      />

      {/* Data Source Controls */}
      <DataSourceControls
        isLoadingLive={isLoadingLive}
        onFetchLiveData={fetchLiveData}
        liveDataCount={liveDataCount}
        dataSource={dataSource}
      />

      {/* Instructions */}
      <div className="absolute bottom-6 right-4 z-10 glass-panel-sm px-4 py-2.5 animate-fade-in-up opacity-0" style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}>
        <p className="text-xs text-slate-400">
          <span className="text-cyan-400">Drag</span> to rotate • <span className="text-cyan-400">Scroll</span> to zoom • <span className="text-cyan-400">Click</span> satellite for details
        </p>
      </div>
    </div>
  );
}

export default App;
