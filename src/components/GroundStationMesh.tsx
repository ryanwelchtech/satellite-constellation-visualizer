import React, { useMemo } from 'react';
import * as THREE from 'three';
import { GroundStation } from '../types';

interface GroundStationMeshProps {
  station: GroundStation;
  earthRadius: number;
}

const GroundStationMesh: React.FC<GroundStationMeshProps> = ({ station, earthRadius }) => {
  const position = useMemo(() => {
    const lat = station.location.lat * (Math.PI / 180);
    const lng = station.location.lng * (Math.PI / 180);
    const altitude = earthRadius * 1.01;

    return new THREE.Vector3(
      altitude * Math.cos(lat) * Math.cos(lng),
      altitude * Math.sin(lat),
      altitude * Math.cos(lat) * Math.sin(lng)
    );
  }, [station.location, earthRadius]);

  const color = station.status === 'online' ? '#00ff88' :
                station.status === 'maintenance' ? '#ff9500' : '#ff3366';

  return (
    <group position={position}>
      {/* Station marker */}
      <mesh>
        <coneGeometry args={[0.015, 0.04, 4]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Pulse ring */}
      {station.status === 'online' && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.02, 0.025, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

export default GroundStationMesh;
