import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';

const Earth: React.FC = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  // Load NASA Blue Marble textures from public CDN
  // These are public domain images from NASA's Visible Earth
  const earthTexture = useLoader(
    TextureLoader,
    'https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg'
  );

  const bumpTexture = useLoader(
    TextureLoader,
    'https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png'
  );

  const cloudsTexture = useLoader(
    TextureLoader,
    'https://unpkg.com/three-globe@2.31.1/example/img/earth-clouds.png'
  );

  const nightTexture = useLoader(
    TextureLoader,
    'https://unpkg.com/three-globe@2.31.1/example/img/earth-night.jpg'
  );

  // Configure texture settings
  useMemo(() => {
    [earthTexture, bumpTexture, cloudsTexture, nightTexture].forEach(texture => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.colorSpace = THREE.SRGBColorSpace;
    });
  }, [earthTexture, bumpTexture, cloudsTexture, nightTexture]);

  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.015;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.018;
    }
  });

  return (
    <group>
      {/* Earth sphere with Blue Marble texture */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 128, 128]} />
        <meshStandardMaterial
          map={earthTexture}
          bumpMap={bumpTexture}
          bumpScale={0.03}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Night lights layer */}
      <mesh rotation={earthRef.current?.rotation || [0, 0, 0]}>
        <sphereGeometry args={[1.001, 64, 64]} />
        <meshBasicMaterial
          map={nightTexture}
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Cloud layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[1.015, 64, 64]} />
        <meshStandardMaterial
          map={cloudsTexture}
          transparent
          opacity={0.4}
          depthWrite={false}
          alphaMap={cloudsTexture}
        />
      </mesh>

      {/* Atmosphere glow - inner ring */}
      <mesh ref={atmosphereRef} scale={1.08}>
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          uniforms={{
            glowColor: { value: new THREE.Color('#4a9eff') },
            intensity: { value: 0.6 },
          }}
          vertexShader={`
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              vPosition = position;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec3 vNormal;
            varying vec3 vPosition;
            uniform vec3 glowColor;
            uniform float intensity;
            void main() {
              float glow = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
              gl_FragColor = vec4(glowColor, glow * intensity);
            }
          `}
        />
      </mesh>

      {/* Outer atmosphere halo */}
      <mesh scale={1.2}>
        <sphereGeometry args={[1, 32, 32]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          uniforms={{
            glowColor: { value: new THREE.Color('#1e90ff') },
          }}
          vertexShader={`
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec3 vNormal;
            uniform vec3 glowColor;
            void main() {
              float intensity = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
              gl_FragColor = vec4(glowColor, intensity * 0.25);
            }
          `}
        />
      </mesh>

      {/* Subtle latitude/longitude grid */}
      <mesh>
        <sphereGeometry args={[1.003, 48, 24]} />
        <meshBasicMaterial
          color="#4a9eff"
          wireframe
          transparent
          opacity={0.03}
        />
      </mesh>
    </group>
  );
};

export default Earth;
