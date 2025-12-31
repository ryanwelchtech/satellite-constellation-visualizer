import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Earth: React.FC = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const [textures, setTextures] = useState<{
    earth: THREE.Texture | null;
    bump: THREE.Texture | null;
    clouds: THREE.Texture | null;
    night: THREE.Texture | null;
  }>({ earth: null, bump: null, clouds: null, night: null });
  const [texturesLoaded, setTexturesLoaded] = useState(false);

  // Load textures with error handling
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const textureUrls = {
      earth: 'https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg',
      bump: 'https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png',
      clouds: 'https://unpkg.com/three-globe@2.31.1/example/img/earth-clouds.png',
      night: 'https://unpkg.com/three-globe@2.31.1/example/img/earth-night.jpg',
    };

    const loadedTextures: typeof textures = { earth: null, bump: null, clouds: null, night: null };
    let loadCount = 0;

    const onLoad = (key: keyof typeof loadedTextures) => (texture: THREE.Texture) => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.colorSpace = THREE.SRGBColorSpace;
      loadedTextures[key] = texture;
      loadCount++;
      if (loadCount >= 4) {
        setTextures(loadedTextures);
        setTexturesLoaded(true);
      }
    };

    const onError = (key: keyof typeof loadedTextures) => () => {
      console.warn(`Failed to load ${key} texture, using fallback`);
      loadCount++;
      if (loadCount >= 4) {
        setTextures(loadedTextures);
        setTexturesLoaded(true);
      }
    };

    loader.load(textureUrls.earth, onLoad('earth'), undefined, onError('earth'));
    loader.load(textureUrls.bump, onLoad('bump'), undefined, onError('bump'));
    loader.load(textureUrls.clouds, onLoad('clouds'), undefined, onError('clouds'));
    loader.load(textureUrls.night, onLoad('night'), undefined, onError('night'));
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
        {textures.earth ? (
          <meshStandardMaterial
            map={textures.earth}
            bumpMap={textures.bump || undefined}
            bumpScale={0.03}
            roughness={0.7}
            metalness={0.1}
          />
        ) : (
          <meshStandardMaterial
            color="#1a4a7a"
            roughness={0.8}
            metalness={0.1}
          />
        )}
      </mesh>

      {/* Night lights layer */}
      {textures.night && (
        <mesh rotation={earthRef.current?.rotation || [0, 0, 0]}>
          <sphereGeometry args={[1.001, 64, 64]} />
          <meshBasicMaterial
            map={textures.night}
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Cloud layer */}
      {textures.clouds && (
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[1.015, 64, 64]} />
          <meshStandardMaterial
            map={textures.clouds}
            transparent
            opacity={0.4}
            depthWrite={false}
            alphaMap={textures.clouds}
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
