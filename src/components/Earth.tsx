import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Earth: React.FC = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const nightLightsRef = useRef<THREE.Mesh>(null);

  // Create realistic Earth texture using advanced procedural generation
  const earthTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Deep ocean gradient base
    const oceanGradient = ctx.createLinearGradient(0, 0, 0, 1024);
    oceanGradient.addColorStop(0, '#0a3d62');
    oceanGradient.addColorStop(0.3, '#1a5276');
    oceanGradient.addColorStop(0.5, '#1e8449');
    oceanGradient.addColorStop(0.7, '#1a5276');
    oceanGradient.addColorStop(1, '#0a3d62');
    ctx.fillStyle = '#0d4f6f';
    ctx.fillRect(0, 0, 2048, 1024);

    // Add ocean depth variation
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * 2048;
      const y = Math.random() * 1024;
      const size = Math.random() * 100 + 50;
      const opacity = Math.random() * 0.15;
      ctx.fillStyle = `rgba(10, 60, 90, ${opacity})`;
      ctx.beginPath();
      ctx.ellipse(x, y, size, size * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    // Continent definitions with realistic shapes
    const continents = [
      // North America
      { points: [[140, 80], [280, 100], [320, 180], [280, 280], [200, 340], [100, 280], [80, 180]], color: '#2d5a3d' },
      // South America
      { points: [[220, 360], [300, 380], [320, 520], [280, 640], [200, 700], [160, 600], [180, 440]], color: '#3d7a4d' },
      // Europe
      { points: [[480, 120], [560, 100], [600, 140], [580, 200], [520, 220], [460, 180]], color: '#4a8a5a' },
      // Africa
      { points: [[480, 240], [600, 220], [640, 320], [620, 480], [540, 560], [460, 500], [440, 360]], color: '#5d9a6a' },
      // Asia
      { points: [[560, 80], [800, 60], [900, 120], [880, 200], [800, 280], [700, 320], [600, 280], [580, 180]], color: '#4a8a5a' },
      // Russia/Siberia
      { points: [[600, 60], [900, 40], [1000, 80], [980, 160], [880, 180], [700, 140], [620, 100]], color: '#6aaa7a' },
      // India
      { points: [[720, 280], [780, 280], [760, 400], [700, 380]], color: '#5d9a6a' },
      // Southeast Asia
      { points: [[820, 300], [900, 280], [940, 360], [900, 420], [840, 400]], color: '#4a8a5a' },
      // Australia
      { points: [[880, 480], [1000, 460], [1040, 540], [1000, 620], [900, 600], [860, 540]], color: '#7a6a4a' },
      // Indonesia archipelago
      { points: [[880, 400], [960, 420], [940, 460], [880, 440]], color: '#4a8a5a' },
      // Japan
      { points: [[920, 200], [960, 180], [980, 240], [940, 260]], color: '#5d9a6a' },
      // Greenland
      { points: [[340, 60], [420, 40], [440, 100], [400, 140], [340, 120]], color: '#e8e8e8' },
      // Antarctica
      { points: [[0, 900], [500, 920], [1024, 940], [1500, 920], [2048, 900], [2048, 1024], [0, 1024]], color: '#f0f0f0' },
      // Arctic ice
      { points: [[0, 0], [2048, 0], [2048, 40], [1500, 60], [1000, 50], [500, 60], [0, 40]], color: '#e0e8f0' },
      // UK/Ireland
      { points: [[440, 140], [470, 130], [480, 170], [450, 180]], color: '#4a8a5a' },
      // Scandinavia
      { points: [[500, 60], [560, 50], [580, 120], [520, 140], [490, 100]], color: '#5d9a6a' },
      // New Zealand
      { points: [[1020, 620], [1060, 600], [1080, 680], [1040, 700]], color: '#4a8a5a' },
      // Madagascar
      { points: [[620, 480], [660, 460], [680, 540], [640, 580]], color: '#5d9a6a' },
      // Middle East
      { points: [[580, 240], [660, 220], [680, 300], [620, 320]], color: '#8a7a5a' },
      // Central America
      { points: [[180, 320], [240, 300], [260, 360], [200, 380]], color: '#4a8a5a' },
      // Caribbean islands
      { points: [[240, 300], [300, 280], [320, 320], [280, 340]], color: '#4a8a5a' },
    ];

    // Draw continents with gradients
    continents.forEach(continent => {
      ctx.beginPath();
      ctx.moveTo(continent.points[0][0], continent.points[0][1]);
      for (let i = 1; i < continent.points.length; i++) {
        ctx.lineTo(continent.points[i][0], continent.points[i][1]);
      }
      ctx.closePath();

      // Create gradient for each continent
      const gradient = ctx.createRadialGradient(
        continent.points[0][0], continent.points[0][1], 0,
        continent.points[0][0], continent.points[0][1], 200
      );
      gradient.addColorStop(0, continent.color);
      gradient.addColorStop(1, adjustColor(continent.color, -20));
      ctx.fillStyle = gradient;
      ctx.fill();

      // Add terrain variation
      ctx.strokeStyle = adjustColor(continent.color, -30);
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Add mountain ranges
    const mountains = [
      { x: 180, y: 200, name: 'Rockies' },
      { x: 240, y: 500, name: 'Andes' },
      { x: 500, y: 160, name: 'Alps' },
      { x: 780, y: 200, name: 'Himalayas' },
    ];

    mountains.forEach(mountain => {
      for (let i = 0; i < 15; i++) {
        const mx = mountain.x + (Math.random() - 0.5) * 60;
        const my = mountain.y + (Math.random() - 0.5) * 40;
        ctx.fillStyle = `rgba(100, 80, 60, ${0.3 + Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.moveTo(mx, my + 10);
        ctx.lineTo(mx + 8, my - 10);
        ctx.lineTo(mx + 16, my + 10);
        ctx.fill();
      }
    });

    // Add desert regions
    const deserts = [
      { x: 520, y: 280, w: 100, h: 80 }, // Sahara
      { x: 620, y: 260, w: 60, h: 60 }, // Arabian
      { x: 920, y: 500, w: 80, h: 60 }, // Australian outback
    ];

    deserts.forEach(desert => {
      ctx.fillStyle = 'rgba(180, 150, 100, 0.4)';
      ctx.beginPath();
      ctx.ellipse(desert.x, desert.y, desert.w, desert.h, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Add subtle noise texture for realism
    const imageData = ctx.getImageData(0, 0, 2048, 1024);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 10;
      imageData.data[i] = Math.max(0, Math.min(255, imageData.data[i] + noise));
      imageData.data[i + 1] = Math.max(0, Math.min(255, imageData.data[i + 1] + noise));
      imageData.data[i + 2] = Math.max(0, Math.min(255, imageData.data[i + 2] + noise));
    }
    ctx.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, []);

  // Create bump map for terrain
  const bumpTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base gray
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 1024, 512);

    // Add continental elevation
    const imageData = ctx.getImageData(0, 0, 1024, 512);
    for (let y = 0; y < 512; y++) {
      for (let x = 0; x < 1024; x++) {
        const i = (y * 1024 + x) * 4;
        // Simple elevation based on latitude
        const latFactor = Math.abs(y - 256) / 256;
        const elevation = 128 + (Math.random() - 0.5) * 30 + latFactor * 20;
        imageData.data[i] = elevation;
        imageData.data[i + 1] = elevation;
        imageData.data[i + 2] = elevation;
      }
    }
    ctx.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, []);

  // Create cloud texture
  const cloudTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, 2048, 1024);

    // Generate cloud patterns
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * 2048;
      const y = 100 + Math.random() * 824; // Avoid poles
      const size = Math.random() * 150 + 50;
      const opacity = Math.random() * 0.3 + 0.1;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
      gradient.addColorStop(0.5, `rgba(255, 255, 255, ${opacity * 0.5})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(x, y, size, size * 0.4, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, []);

  // City lights texture for night side
  const nightLightsTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, 2048, 1024);

    // Major city clusters
    const cityClusters = [
      // North America
      { x: 200, y: 200, density: 40, spread: 100 }, // East Coast
      { x: 100, y: 220, density: 25, spread: 60 }, // West Coast
      // Europe
      { x: 500, y: 160, density: 50, spread: 80 },
      // East Asia
      { x: 860, y: 220, density: 60, spread: 120 },
      // India
      { x: 740, y: 320, density: 40, spread: 80 },
      // South America
      { x: 260, y: 500, density: 20, spread: 60 },
      // Australia
      { x: 940, y: 560, density: 15, spread: 50 },
    ];

    cityClusters.forEach(cluster => {
      for (let i = 0; i < cluster.density; i++) {
        const x = cluster.x + (Math.random() - 0.5) * cluster.spread;
        const y = cluster.y + (Math.random() - 0.5) * cluster.spread * 0.6;
        const size = Math.random() * 3 + 1;

        ctx.fillStyle = `rgba(255, 200, 100, ${0.5 + Math.random() * 0.5})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
        gradient.addColorStop(0, 'rgba(255, 180, 80, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 180, 80, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, []);

  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.015;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.02;
    }
    if (nightLightsRef.current) {
      nightLightsRef.current.rotation.y += delta * 0.015;
    }
  });

  return (
    <group>
      {/* Earth sphere */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 128, 128]} />
        <meshStandardMaterial
          map={earthTexture}
          bumpMap={bumpTexture}
          bumpScale={0.02}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Night lights layer (slightly larger to prevent z-fighting) */}
      <mesh ref={nightLightsRef}>
        <sphereGeometry args={[1.001, 64, 64]} />
        <meshBasicMaterial
          map={nightLightsTexture}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Cloud layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[1.015, 64, 64]} />
        <meshStandardMaterial
          map={cloudTexture}
          transparent
          opacity={0.6}
          depthWrite={false}
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

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
  return `rgb(${r}, ${g}, ${b})`;
}

export default Earth;
