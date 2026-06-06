'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Environment, Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Animated Property Card Component
function PropertyCard({ position, rotation, title, index }: any) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y += Math.sin(clock.getElapsedTime() * 0.5 + index * 2) * 0.0005;
      meshRef.current.rotation.x += 0.0002;
      meshRef.current.rotation.z += 0.0001;
    }
  });

  return (
    <group ref={meshRef} position={position} rotation={rotation}>
      {/* Card background */}
      <mesh>
        <planeGeometry args={[2.5, 3.5, 1]} />
        <meshStandardMaterial
          color="#0d1b2a"
          metalness={0.6}
          roughness={0.4}
          emissive="#1a472a"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Card border/glow */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[2.6, 3.6]} />
        <meshBasicMaterial
          color="#2d5f3f"
          transparent={true}
          opacity={0.2}
        />
      </mesh>

      {/* Image placeholder - gradient effect */}
      <mesh position={[0, 0.5, 0.02]}>
        <planeGeometry args={[2.3, 2]} />
        <meshStandardMaterial
          color="#1a472a"
          metalness={0.7}
          roughness={0.2}
          emissive="#2d5f3f"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Text label */}
      <Text
        position={[0, -1.2, 0.03]}
        fontSize={0.4}
        color="#e8f5e9"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Geist-Bold.ttf"
      >
        {title}
      </Text>
    </group>
  );
}

// Geometric shapes for visual interest
function GeometricShapes() {
  const group1 = useRef<THREE.Group>(null);
  const group2 = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (group1.current) {
      group1.current.rotation.z += 0.0002;
      group1.current.position.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.3;
    }
    if (group2.current) {
      group2.current.rotation.z -= 0.0001;
      group2.current.position.y = Math.cos(clock.getElapsedTime() * 0.4) * 0.25;
    }
  });

  return (
    <>
      <group ref={group1} position={[-4, 2, -3]}>
        <mesh>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#2d5f3f"
            emissive="#2d5f3f"
            emissiveIntensity={0.5}
            wireframe={true}
            transparent={true}
            opacity={0.4}
          />
        </mesh>
      </group>

      <group ref={group2} position={[5, -1, -2]}>
        <mesh>
          <icosahedronGeometry args={[1.2, 0]} />
          <meshStandardMaterial
            color="#1a472a"
            emissive="#2d5f3f"
            emissiveIntensity={0.4}
            wireframe={true}
            transparent={true}
            opacity={0.3}
          />
        </mesh>
      </group>
    </>
  );
}

// Main 3D Scene
function HeroScene() {
  return (
    <>
      <Environment preset="studio" />

      {/* Ambient light */}
      <ambientLight intensity={0.6} color="#ffffff" />

      {/* Key light */}
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#e8f5e9" />

      {/* Fill light */}
      <pointLight position={[-5, 3, 3]} intensity={0.4} color="#2d5f3f" />

      {/* Geometric background shapes */}
      <GeometricShapes />

      {/* Animated property cards */}
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
        <PropertyCard
          position={[-2.5, 0.5, 0]}
          rotation={[0.2, 0.3, 0.1]}
          title="Premium"
          index={0}
        />
      </Float>

      <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.25} floatingRange={[0, 0.3]}>
        <PropertyCard
          position={[0, -0.3, -1]}
          rotation={[-0.1, -0.2, 0.05]}
          title="Curated"
          index={1}
        />
      </Float>

      <Float speed={0.9} rotationIntensity={0.18} floatIntensity={0.2}>
        <PropertyCard
          position={[2.5, 0.2, -0.5]}
          rotation={[0.15, 0.1, -0.08]}
          title="Verified"
          index={2}
        />
      </Float>

      {/* Main heading text */}
      <Text
        position={[0, 2.5, -2]}
        fontSize={0.8}
        color="#e8f5e9"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Geist-Bold.ttf"
        maxWidth={10}
      >
        Experience Premium Living
      </Text>

      <Text
        position={[0, 1.8, -2]}
        fontSize={0.45}
        color="#b0d4a8"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Geist-Regular.ttf"
        maxWidth={10}
      >
        Technology-Driven Curation
      </Text>
    </>
  );
}

export default function MotionGraphicHero() {
  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-[#0d1b2a] via-[#1a472a] to-[#0d1b2a] overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{
          antialias: true,
          alpha: false,
        }}
      >
        <HeroScene />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* Text Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
        <div className="text-center space-y-6 z-10">
          <h1 className="text-6xl md:text-7xl font-bold text-[#e8f5e9] drop-shadow-lg">
            NestScout
          </h1>
          <p className="text-xl md:text-2xl text-[#b0d4a8] max-w-2xl drop-shadow-md">
            Where Technology Meets Editorial Curation
          </p>
          <button className="mt-8 px-8 py-4 bg-[#2d5f3f] hover:bg-[#3a7a50] text-[#e8f5e9] font-semibold rounded-lg transition-colors duration-300 shadow-lg pointer-events-auto">
            Discover Curated Homes
          </button>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0d1b2a] to-transparent pointer-events-none"></div>
    </div>
  );
}
