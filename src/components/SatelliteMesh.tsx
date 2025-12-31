import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { Satellite } from '../types';

interface SatelliteMeshProps {
  satellite: Satellite;
  earthRadius: number;
  scaleFactor: number;
  isSelected: boolean;
  onClick: () => void;
  constellationColor?: string;
}

const SatelliteMesh: React.FC<SatelliteMeshProps> = ({
  satellite,
  earthRadius,
  scaleFactor,
  isSelected,
  onClick,
  constellationColor = '#ffffff'
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  // Calculate orbital radius (Earth radius + altitude in scene units)
  const orbitalRadius = earthRadius + (satellite.altitude * scaleFactor);

  // Convert angles to radians
  const inclination = satellite.inclination * (Math.PI / 180);
  const initialLng = satellite.position.lng * (Math.PI / 180);

  // Create orbit path points - a tilted circle around Earth
  const orbitPoints = useMemo(() => {
    const points: [number, number, number][] = [];

    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI * 2;

      // Create a circle in XZ plane, then rotate by inclination around X axis
      const x = orbitalRadius * Math.cos(theta);
      const y = orbitalRadius * Math.sin(theta) * Math.sin(inclination);
      const z = orbitalRadius * Math.sin(theta) * Math.cos(inclination);

      points.push([x, y, z]);
    }

    return points;
  }, [orbitalRadius, inclination]);

  // Animate satellite along its orbit
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;

      // Angular velocity: faster for shorter periods (LEO), slower for longer periods (GEO)
      // Normalize to make LEO complete orbit in ~60 seconds, GEO much slower
      const angularSpeed = (2 * Math.PI) / (satellite.period * 2); // Complete orbit in period*2 seconds
      const theta = time * angularSpeed + initialLng;

      // Position on tilted orbital plane
      const x = orbitalRadius * Math.cos(theta);
      const y = orbitalRadius * Math.sin(theta) * Math.sin(inclination);
      const z = orbitalRadius * Math.sin(theta) * Math.cos(inclination);

      meshRef.current.position.set(x, y, z);

      // Update selection ring position too
      if (ringRef.current) {
        ringRef.current.position.set(x, y, z);
      }
    }
  });

  // Size based on orbit type - larger for higher orbits so they remain visible
  const size = satellite.orbitType === 'GEO' ? 0.06 : satellite.orbitType === 'MEO' ? 0.05 : 0.03;

  // Initial position calculation for first frame
  const initialPosition = useMemo(() => {
    const x = orbitalRadius * Math.cos(initialLng);
    const y = orbitalRadius * Math.sin(initialLng) * Math.sin(inclination);
    const z = orbitalRadius * Math.sin(initialLng) * Math.cos(inclination);
    return new THREE.Vector3(x, y, z);
  }, [orbitalRadius, initialLng, inclination]);

  return (
    <group>
      {/* Orbit path */}
      {isSelected && (
        <Line
          points={orbitPoints}
          color={constellationColor}
          transparent
          opacity={0.4}
          lineWidth={1.5}
        />
      )}

      {/* Satellite */}
      <mesh
        ref={meshRef}
        position={initialPosition}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <sphereGeometry args={[size, 12, 12]} />
        <meshBasicMaterial
          color={constellationColor}
          transparent
          opacity={satellite.status === 'operational' ? 1 : 0.5}
        />
      </mesh>

      {/* Selection ring */}
      {isSelected && (
        <mesh ref={ringRef} position={initialPosition}>
          <ringGeometry args={[size * 1.5, size * 2, 16]} />
          <meshBasicMaterial color={constellationColor} transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

export default SatelliteMesh;
