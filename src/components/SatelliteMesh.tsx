import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Satellite } from '../types';
import { constellations } from '../data/satellites';

interface SatelliteMeshProps {
  satellite: Satellite;
  earthRadius: number;
  scaleFactor: number;
  isSelected: boolean;
  onClick: () => void;
}

const SatelliteMesh: React.FC<SatelliteMeshProps> = ({
  satellite,
  earthRadius,
  scaleFactor,
  isSelected,
  onClick
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.Line>(null);

  const constellation = constellations.find(c => c.id === satellite.constellation);
  const color = constellation?.color || '#ffffff';

  // Calculate position in 3D space
  const position = useMemo(() => {
    const lat = satellite.position.lat * (Math.PI / 180);
    const lng = satellite.position.lng * (Math.PI / 180);
    const altitude = earthRadius + (satellite.altitude * scaleFactor);

    return new THREE.Vector3(
      altitude * Math.cos(lat) * Math.cos(lng),
      altitude * Math.sin(lat),
      altitude * Math.cos(lat) * Math.sin(lng)
    );
  }, [satellite.position, satellite.altitude, earthRadius, scaleFactor]);

  // Create orbit path
  const orbitGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const altitude = earthRadius + (satellite.altitude * scaleFactor);
    const inclination = satellite.inclination * (Math.PI / 180);

    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      const x = altitude * Math.cos(angle);
      const y = altitude * Math.sin(angle) * Math.sin(inclination);
      const z = altitude * Math.sin(angle) * Math.cos(inclination);
      points.push(new THREE.Vector3(x, y, z));
    }

    return new THREE.BufferGeometry().setFromPoints(points);
  }, [satellite.altitude, satellite.inclination, earthRadius, scaleFactor]);

  // Animate satellite along orbit
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      const speed = 0.1 / (satellite.period / 90); // Faster for LEO, slower for GEO
      const angle = time * speed;

      const altitude = earthRadius + (satellite.altitude * scaleFactor);
      const inclination = satellite.inclination * (Math.PI / 180);
      const lng = satellite.position.lng * (Math.PI / 180);

      meshRef.current.position.x = altitude * Math.cos(angle + lng);
      meshRef.current.position.y = altitude * Math.sin(angle) * Math.sin(inclination);
      meshRef.current.position.z = altitude * Math.sin(angle + lng) * Math.cos(inclination);
    }
  });

  const size = satellite.orbitType === 'GEO' ? 0.03 : 0.02;

  return (
    <group>
      {/* Orbit path */}
      {isSelected && (
        <line ref={orbitRef} geometry={orbitGeometry}>
          <lineBasicMaterial color={color} transparent opacity={0.3} />
        </line>
      )}

      {/* Satellite */}
      <mesh
        ref={meshRef}
        position={position}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <sphereGeometry args={[size, 8, 8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={satellite.status === 'operational' ? 1 : 0.5}
        />
      </mesh>

      {/* Selection ring */}
      {isSelected && (
        <mesh position={position}>
          <ringGeometry args={[size * 1.5, size * 2, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

export default SatelliteMesh;
