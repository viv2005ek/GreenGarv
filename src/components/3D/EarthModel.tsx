import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, useTexture } from '@react-three/drei'
import * as THREE from 'three'

export function EarthModel() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  // Load earth texture (using a placeholder color for now)
  const earthTexture = useTexture('/earth-texture.jpg', () => {
    // Fallback to a colored sphere if texture fails to load
    return new THREE.MeshStandardMaterial({ 
      color: '#4ade80',
      roughness: 0.8,
      metalness: 0.2
    })
  })

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <group>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Sphere ref={meshRef} args={[2, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#4ade80" 
          roughness={0.8} 
          metalness={0.2}
          emissive="#166534"
          emissiveIntensity={0.1}
        />
      </Sphere>
      
      {/* Floating particles around Earth */}
      {Array.from({ length: 50 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
          ]}
        >
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial 
            color="#10b981" 
            emissive="#10b981"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  )
}