import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import Earth from './Earth';
import SatelliteMesh from './SatelliteMesh';
import GroundStationMesh from './GroundStationMesh';
import { Satellite, GroundStation } from '../types';

interface SceneProps {
  satellites: Satellite[];
  groundStations: GroundStation[];
  visibleConstellations: string[];
  selectedSatellite: Satellite | null;
  onSelectSatellite: (satellite: Satellite | null) => void;
}

const EARTH_RADIUS = 1;
const EARTH_RADIUS_KM = 6371; // Real Earth radius in km
const SCALE_FACTOR = 1 / EARTH_RADIUS_KM; // Scale km to scene units (1 scene unit = Earth radius)

const Scene: React.FC<SceneProps> = ({
  satellites,
  groundStations,
  visibleConstellations,
  selectedSatellite,
  onSelectSatellite
}) => {
  const visibleSatellites = satellites.filter(s =>
    visibleConstellations.includes(s.constellation)
  );

  return (
    <Canvas
      className="w-full h-full"
      gl={{ antialias: true, alpha: true }}
      onPointerMissed={() => onSelectSatellite(null)}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 3, 5]} intensity={1} />
      <pointLight position={[-5, -3, -5]} intensity={0.3} color="#4a9eff" />

      {/* Stars background */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
      />

      <Suspense fallback={null}>
        {/* Earth */}
        <Earth />

        {/* Satellites */}
        {visibleSatellites.map((satellite) => (
          <SatelliteMesh
            key={satellite.id}
            satellite={satellite}
            earthRadius={EARTH_RADIUS}
            scaleFactor={SCALE_FACTOR}
            isSelected={selectedSatellite?.id === satellite.id}
            onClick={() => onSelectSatellite(satellite)}
          />
        ))}

        {/* Ground Stations */}
        {groundStations.map((station) => (
          <GroundStationMesh
            key={station.id}
            station={station}
            earthRadius={EARTH_RADIUS}
          />
        ))}
      </Suspense>

      {/* Controls */}
      <OrbitControls
        enablePan={false}
        minDistance={1.5}
        maxDistance={20}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
      />
    </Canvas>
  );
};

export default Scene;
