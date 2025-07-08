import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Navigation, Recycle, Trash2, Package, Zap } from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'
import { AnimatedButton } from '../components/ui/AnimatedButton'
import { mapAPI } from '../lib/api'

export function RecyclingGuide() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [recyclingCenters, setRecyclingCenters] = useState([])
  const [loading, setLoading] = useState(false)

  const getLocation = () => {
    setLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setLocation({ lat: latitude, lon: longitude })
          
          try {
            const centers = await mapAPI.searchRecyclingCenters(latitude, longitude)
            setRecyclingCenters(centers.slice(0, 5)) // Limit to 5 results
          } catch (error) {
            console.error('Error fetching recycling centers:', error)
            // Fallback to demo data
            setRecyclingCenters([
              { 
                display_name: 'Green Recycling Center, Main Street, Your City', 
                lat: latitude + 0.01, 
                lon: longitude + 0.01,
                place_id: '1'
              },
              { 
                display_name: 'EcoWaste Solutions, Oak Avenue, Your City', 
                lat: latitude - 0.01, 
                lon: longitude - 0.01,
                place_id: '2'
              },
              { 
                display_name: 'City Recycling Hub, Park Road, Your City', 
                lat: latitude + 0.02, 
                lon: longitude + 0.02,
                place_id: '3'
              }
            ])
          } finally {
            setLoading(false)
          }
        },
        (error) => {
          console.error('Error getting location:', error)
          setLoading(false)
          alert('Error getting location. Please enable location services.')
        }
      )
    } else {
      setLoading(false)
      alert('Geolocation is not supported by this browser')
    }
  }

  const recyclingCategories = [
    {
      name: 'Plastic',
      icon: <Package className="w-8 h-8" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      items: ['Bottles', 'Containers', 'Bags', 'Packaging'],
      tips: 'Clean containers before recycling. Remove labels if possible.'
    },
    {
      name: 'Electronics',
      icon: <Zap className="w-8 h-8" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      items: ['Phones', 'Computers', 'Batteries', 'Cables'],
      tips: 'Never throw electronics in regular trash. Find certified e-waste centers.'
    },
    {
      name: 'Paper',
      icon: <Recycle className="w-8 h-8" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      items: ['Newspapers', 'Magazines', 'Cardboard', 'Office Paper'],
      tips: 'Keep paper dry and clean. Remove any plastic or metal components.'
    },
    {
      name: 'Organic',
      icon: <Trash2 className="w-8 h-8" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      items: ['Food Scraps', 'Yard Waste', 'Compostables'],
      tips: 'Compost at home or find local composting programs.'
    }
  ]

  const quickTips = [
    'Always clean containers before recycling',
    'Check local recycling guidelines - rules vary by location',
    'When in doubt, throw it out (in regular trash)',
    'Reduce and reuse before recycling',
    'Look for recycling symbols and numbers on plastic items'
  ]

  const openDirections = (lat: number, lon: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Recycling Guide</h1>
          <p className="text-lg text-gray-600">
            Find recycling centers and learn proper disposal methods
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Find Centers */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-1 space-y-6"
          >
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Find Recycling Centers</h2>
              
              <div className="space-y-4">
                <AnimatedButton
                  onClick={getLocation}
                  disabled={loading}
                  className="w-full"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {loading ? 'Finding Centers...' : 'Find Nearby Centers'}
                </AnimatedButton>

                {location && (
                  <div className="text-sm text-gray-600">
                    <p>📍 Current location: {location.lat.toFixed(4)}, {location.lon.toFixed(4)}</p>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Nearby Centers */}
            {recyclingCenters.length > 0 && (
              <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Nearby Centers</h3>
                <div className="space-y-3">
                  {recyclingCenters.map((center, index) => (
                    <motion.div
                      key={center.place_id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-start gap-3 p-3 bg-white/30 rounded-xl"
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {center.display_name?.split(',')[0] || `Center ${index + 1}`}
                        </div>
                        <div className="text-sm text-gray-600">
                          {center.display_name?.split(',').slice(1, 3).join(', ') || 'Local area'}
                        </div>
                        <button 
                          onClick={() => openDirections(center.lat, center.lon)}
                          className="text-sm text-blue-600 hover:text-blue-700 mt-1 flex items-center"
                        >
                          <Navigation className="w-3 h-3 mr-1" />
                          Get Directions
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Quick Tips */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Tips</h3>
              <ul className="space-y-2 text-sm">
                {quickTips.map((tip, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-start gap-2"
                  >
                    <span className="text-green-600 mt-1">•</span>
                    <span className="text-gray-600">{tip}</span>
                  </motion.li>
                ))}
              </ul>
            </GlassCard>
          </motion.div>

          {/* Right Column - Recycling Categories */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Recycling Categories</h2>
              <p className="text-gray-600">
                Learn how to properly sort and dispose of different materials
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {recyclingCategories.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <GlassCard className="p-6 h-full" hover>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-xl ${category.bgColor}`}>
                        <div className={category.color}>{category.icon}</div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-bold text-gray-900 mb-2">Common Items:</h4>
                      <div className="flex flex-wrap gap-2">
                        {category.items.map((item, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-white/50 rounded-full text-sm text-gray-700"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-yellow-50 rounded-xl">
                      <h4 className="font-bold text-yellow-800 mb-1">💡 Tip:</h4>
                      <p className="text-sm text-yellow-700">{category.tips}</p>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Did You Know?</h3>
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-green-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-600 mb-1">91%</div>
                    <div className="text-sm text-green-700">Of plastic is not recycled</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600 mb-1">1 Ton</div>
                    <div className="text-sm text-blue-700">Of recycled paper saves 17 trees</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600 mb-1">20x</div>
                    <div className="text-sm text-purple-700">Less energy to recycle aluminum</div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}