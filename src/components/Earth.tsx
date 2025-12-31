import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Texture URLs from Three.js examples (reliable GitHub-hosted textures)
const TEXTURE_URLS = {
  earth: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
  bump: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg',
  clouds: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png',
  night: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_lights_2048.png',
};

// Inner component that uses textures
const EarthWithTextures: React.FC = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  const nightRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  // Load textures using drei's useTexture which handles Suspense
  const earthTexture = useTexture(TEXTURE_URLS.earth);
  const bumpTexture = useTexture(TEXTURE_URLS.bump);
  const cloudsTexture = useTexture(TEXTURE_URLS.clouds);
  const nightTexture = useTexture(TEXTURE_URLS.night);

  // Memoize material properties to ensure textures are properly applied
  const earthMaterial = useMemo(() => {
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    earthTexture.needsUpdate = true;
    return {
      map: earthTexture,
      normalMap: bumpTexture,
      normalScale: new THREE.Vector2(0.5, 0.5),
      roughness: 0.8,
      metalness: 0,
    };
  }, [earthTexture, bumpTexture]);

  const nightMaterial = useMemo(() => {
    nightTexture.colorSpace = THREE.SRGBColorSpace;
    nightTexture.needsUpdate = true;
    return {
      map: nightTexture,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    };
  }, [nightTexture]);

  useFrame((state, delta) => {
    const rotationSpeed = delta * 0.015;
    if (earthRef.current) {
      earthRef.current.rotation.y += rotationSpeed;
    }
    if (nightRef.current) {
      nightRef.current.rotation.y += rotationSpeed;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.018;
    }
  });

  return (
    <>
      {/* Earth sphere with Blue Marble texture */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 128, 128]} />
        <meshStandardMaterial {...earthMaterial} />
      </mesh>

      {/* Night lights layer */}
      <mesh ref={nightRef}>
        <sphereGeometry args={[1.002, 64, 64]} />
        <meshBasicMaterial {...nightMaterial} />
      </mesh>

      {/* Cloud layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[1.01, 64, 64]} />
        <meshStandardMaterial
          map={cloudsTexture}
          transparent
          opacity={0.3}
          depthWrite={false}
          alphaMap={cloudsTexture}
        />
      </mesh>
    </>
  );
};

// Fallback Earth while textures load
const EarthFallback: React.FC = () => {
  const earthRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.015;
    }
  });

  return (
    <mesh ref={earthRef}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        color="#1a4a7a"
        roughness={0.8}
        metalness={0}
      />
    </mesh>
  );
};

const Earth: React.FC = () => {
  const atmosphereRef = useRef<THREE.Mesh>(null);

  return (
    <group>
      {/* Earth with textures - wrapped in error boundary logic */}
      <React.Suspense fallback={<EarthFallback />}>
        <EarthWithTextures />
      </React.Suspense>

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
