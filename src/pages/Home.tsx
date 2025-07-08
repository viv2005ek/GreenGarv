import React, { useEffect, useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useTexture } from '@react-three/drei'
import { motion } from 'framer-motion'
import { Leaf, Globe, Recycle, Zap } from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'
import { AnimatedButton } from '../components/ui/AnimatedButton'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import { Background } from '../components/Background'

function EarthModel() {
  const earthTexture = useTexture('/earth3d.jpg')
  return (
    <mesh>
      <sphereGeometry args={[3, 64, 64]} />
      <meshStandardMaterial 
        map={earthTexture}
        roughness={0}  // Reduced roughness for more shine
        metalness={0}  // Reduced metalness for natural look
        color={[8, 8, 8]} // Brightness multiplier
      />
    </mesh>
  )
}

export function Home() {
  const [globalStats, setGlobalStats] = useState({
    co2Saved: 0,
    treesPlanted: 0,
    usersActive: 0,
    wasteReduced: 0
  })

  const featuresRef = useRef(null)

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const { data } = await supabase
          .from('global_stats')
          .select('*')
          .single()
        
        if (data) setGlobalStats(data)
      } catch (error) {
        console.error('Error fetching global stats:', error)
        setGlobalStats({
          co2Saved: 15420,
          treesPlanted: 3240,
          usersActive: 12580,
          wasteReduced: 8960
        })
      }
    }
    fetchGlobalStats()
  }, [])

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const features = [
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Carbon Tracking",
      description: "Monitor your carbon footprint in real-time with AI-powered insights",
      gradient: "from-green-500 to-emerald-600",
      link: "/tracker"
    },
    {
      icon: <Leaf className="w-8 h-8" />,
      title: "Product Scanner",
      description: "Scan products to discover their environmental impact instantly",
      gradient: "from-blue-500 to-cyan-600",
      link: "/scan"
    },
    {
      icon: <Recycle className="w-8 h-8" />,
      title: "Recycling Guide",
      description: "Find nearby recycling centers and learn proper disposal methods",
      gradient: "from-purple-500 to-violet-600",
      link: "/recycle"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Eco Rewards",
      description: "Earn points for sustainable choices and unlock green rewards",
      gradient: "from-orange-500 to-red-600",
      link: "/dashboard"
    }
  ]

  return (
    <div className="min-h-screen text-white relative">
      <Background />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-32 px-4 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-6xl font-bold mb-6">
                Make Every Choice{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                  Count
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                GreenGARV empowers you to live sustainably with AI-powered carbon tracking, 
                product analysis, and personalized eco-friendly recommendations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <AnimatedButton className="text-lg px-8 py-4">
                    Start Your Journey
                  </AnimatedButton>
                </Link>
                <AnimatedButton 
                  variant="outline"
                  className="text-lg px-8 py-4"
                  onClick={scrollToFeatures}
                >
                  Learn More
                </AnimatedButton>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative h-[500px]"
            >
              <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <EarthModel />
                <OrbitControls 
                  enableZoom={false}
                  minPolarAngle={Math.PI / 6}
                  maxPolarAngle={Math.PI - Math.PI / 6}
                />
              </Canvas>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Global Impact Stats */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">
              Global Impact
            </h2>
            <p className="text-lg text-gray-300">
              Together, we're making a difference
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "CO₂ Saved", value: globalStats.co2Saved, unit: "kg", color: "text-green-400" },
              { label: "Trees Planted", value: globalStats.treesPlanted, unit: "", color: "text-emerald-400" },
              { label: "Active Users", value: globalStats.usersActive, unit: "", color: "text-blue-400" },
              { label: "Waste Reduced", value: globalStats.wasteReduced, unit: "kg", color: "text-purple-400" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <GlassCard className="text-center p-6" hover>
                  <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                    {(stat.value ?? 0).toLocaleString()}{stat.unit && <span className="text-sm ml-1">{stat.unit}</span>}
                  </div>
                  <div className="text-gray-300">{stat.label}</div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-300">
              Everything you need to live more sustainably
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link to={feature.link}>
                  <GlassCard className="p-8 text-center h-full" hover>
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} text-white mb-6`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <GlassCard className="p-12">
              <h2 className="text-4xl font-bold mb-6">
                Ready to Start Your Sustainable Journey?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of users who are already making a positive impact on the planet.
              </p>
              <Link to="/auth">
                <AnimatedButton variant="primary" className="text-lg px-10 py-4">
                  Get Started Free
                </AnimatedButton>
              </Link>
            </GlassCard>
          </motion.div>
        </div>
      </section>
    </div>
  )
}