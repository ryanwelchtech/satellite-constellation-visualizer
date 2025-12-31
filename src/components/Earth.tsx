import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Earth: React.FC = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const [earthTexture, setEarthTexture] = useState<THREE.Texture | null>(null);
  const [bumpTexture, setBumpTexture] = useState<THREE.Texture | null>(null);
  const [cloudsTexture, setCloudsTexture] = useState<THREE.Texture | null>(null);
  const [nightTexture, setNightTexture] = useState<THREE.Texture | null>(null);

  // Load textures with error handling
  useEffect(() => {
    const loader = new THREE.TextureLoader();

    // Set crossOrigin for CORS
    loader.crossOrigin = 'anonymous';

    const configureTexture = (texture: THREE.Texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 16;
      return texture;
    };

    // Load earth texture
    loader.load(
      'https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg',
      (texture) => {
        setEarthTexture(configureTexture(texture));
      },
      undefined,
      (err) => console.warn('Failed to load earth texture:', err)
    );

    // Load bump texture
    loader.load(
      'https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png',
      (texture) => setBumpTexture(texture),
      undefined,
      (err) => console.warn('Failed to load bump texture:', err)
    );

    // Load clouds texture
    loader.load(
      'https://unpkg.com/three-globe@2.31.1/example/img/earth-clouds.png',
      (texture) => setCloudsTexture(texture),
      undefined,
      (err) => console.warn('Failed to load clouds texture:', err)
    );

    // Load night texture
    loader.load(
      'https://unpkg.com/three-globe@2.31.1/example/img/earth-night.jpg',
      (texture) => {
        setNightTexture(configureTexture(texture));
      },
      undefined,
      (err) => console.warn('Failed to load night texture:', err)
    );
  }, []);

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
      {/* Earth sphere with Blue Marble texture or fallback */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 128, 128]} />
        <meshStandardMaterial
          map={earthTexture || undefined}
          bumpMap={bumpTexture || undefined}
          bumpScale={0.03}
          roughness={0.7}
          metalness={0.1}
          color={earthTexture ? '#ffffff' : '#1a5a8a'}
        />
      </mesh>

      {/* Night lights layer */}
      {nightTexture && (
        <mesh>
          <sphereGeometry args={[1.001, 64, 64]} />
          <meshBasicMaterial
            map={nightTexture}
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Cloud layer */}
      {cloudsTexture && (
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[1.015, 64, 64]} />
          <meshStandardMaterial
            map={cloudsTexture}
            transparent
            opacity={0.35}
            depthWrite={false}
            alphaMap={cloudsTexture}
          />
        </mesh>
      )}

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
