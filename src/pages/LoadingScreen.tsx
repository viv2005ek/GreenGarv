import React from 'react'
import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { Leaf, Zap, Recycle } from 'lucide-react'

// 3D Earth Model Component
function EarthModel() {
  return (
    <mesh>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial 
        color="#4ade80"
        roughness={0.7}
        metalness={0.3}
        emissive="#4ade80"
        emissiveIntensity={0.3}
      />
    </mesh>
  )
}

// Floating Icons Component
function FloatingIcon({ icon, position, delay }: { icon: React.ReactNode, position: [number, number, number], delay: number }) {
  return (
    <motion.div
      className="absolute text-green-400"
      style={{
        left: `${position[0]}%`,
        top: `${position[1]}%`,
      }}
      animate={{
        y: [0, 15, 0],
        rotate: [0, 10, -10, 0],
        opacity: [0.8, 1, 0.8]
      }}
      transition={{
        duration: 3 + delay,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay
      }}
    >
      {icon}
    </motion.div>
  )
}

export function LoadingScreen() {
  const loadingMessages = [
    "Calculating your carbon impact...",
    "Planting virtual trees...",
    "Analyzing eco-friendly alternatives...",
    "Preparing your sustainability dashboard..."
  ]

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/90 backdrop-blur-md flex items-center justify-center">
      {/* 3D Earth Animation */}
      <div className="absolute w-full h-full">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <EarthModel />
          <OrbitControls 
            enableZoom={false}
            autoRotate
            autoRotateSpeed={2}
          />
        </Canvas>
      </div>

      {/* Floating Eco Icons */}
      <FloatingIcon 
        icon={<Leaf className="w-8 h-8 text-green-400" />} 
        position={[20, 30, 0]} 
        delay={0} 
      />
      <FloatingIcon 
        icon={<Zap className="w-8 h-8 text-yellow-400" />} 
        position={[80, 60, 0]} 
        delay={0.5} 
      />
      <FloatingIcon 
        icon={<Recycle className="w-8 h-8 text-blue-400" />} 
        position={[40, 80, 0]} 
        delay={1} 
      />

      {/* Loading Content */}
      <div className="relative z-10 text-center max-w-md px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-full mb-4">
            <Leaf className="w-10 h-10 text-white" />
          </div>
    <h1 className="text-3xl font-bold text-white mb-2">GreenGARV</h1>
<p className="text-white">Your Personal Eco Companion</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: "easeInOut"
              }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
     <motion.p 
  className="text-emerald-300 mb-6"
  animate={{
    opacity: [0.8, 1, 0.8]
  }}
  transition={{
    duration: 4,
    repeat: Infinity,
    repeatType: 'reverse'
  }}
>
  {loadingMessages[Math.floor(Math.random() * loadingMessages.length)]}
</motion.p>
<p className="text-sm text-white/70">
  Making the world greener, one load at a time...
</p>
        </motion.div>
      </div>
    </div>
  )
}