import React, { useState } from 'react';
import Header from './components/Header';
import StatsPanel from './components/StatsPanel';
import ConstellationPanel from './components/ConstellationPanel';
import SatelliteInfo from './components/SatelliteInfo';
import Scene from './components/Scene';
import { satellites, groundStations, constellations, dashboardStats } from './data/satellites';
import { Satellite } from './types';

function App() {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [visibleConstellations, setVisibleConstellations] = useState<string[]>(
    constellations.map(c => c.id)
  );
  const [selectedConstellation, setSelectedConstellation] = useState<string | null>(null);
  const [selectedSatellite, setSelectedSatellite] = useState<Satellite | null>(null);

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

  return (
    <div className="w-screen h-screen bg-space-darker overflow-hidden star-field">
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
      <StatsPanel stats={dashboardStats} />

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

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 z-10 text-xs text-gray-500 bg-space-dark/80 px-3 py-2 rounded-lg border border-space-blue/20">
        <p>Drag to rotate • Scroll to zoom • Click satellite for details</p>
      </div>
    </div>
  );
}

export default App;
