import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Car, Plane, Home, Utensils, Plus, TrendingDown } from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'
import { AnimatedButton } from '../components/ui/AnimatedButton'
import { carbonAPI } from '../lib/api'

export function CarbonTracker() {
  const [activities, setActivities] = useState([])
  const [newActivity, setNewActivity] = useState({
    type: 'vehicle',
    distance: '',
    vehicle_model_id: 'a4091852-1e5a-4f7c-bb2d-9c3ccbf1b0e6' // Default car model
  })
  const [loading, setLoading] = useState(false)
  const [weeklyData, setWeeklyData] = useState([45, 52, 38, 61, 43, 28, 35])

  const activityTypes = [
    { 
      id: 'vehicle', 
      name: 'Car Travel', 
      icon: <Car className="w-5 h-5" />, 
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    { 
      id: 'flight', 
      name: 'Air Travel', 
      icon: <Plane className="w-5 h-5" />, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    { 
      id: 'electricity', 
      name: 'Home Energy', 
      icon: <Home className="w-5 h-5" />, 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    { 
      id: 'shipping', 
      name: 'Shipping', 
      icon: <Utensils className="w-5 h-5" />, 
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ]

  const handleAddActivity = async () => {
    if (!newActivity.distance) return

    setLoading(true)
    try {
      let requestData = {}
      
      if (newActivity.type === 'vehicle') {
        requestData = {
          type: 'vehicle',
          distance_unit: 'km',
          distance_value: parseFloat(newActivity.distance),
          vehicle_model_id: newActivity.vehicle_model_id
        }
      } else if (newActivity.type === 'flight') {
        requestData = {
          type: 'flight',
          passengers: 1,
          legs: [
            {
              departure_airport: 'sfo',
              destination_airport: 'yyz',
              cabin_class: 'economy'
            }
          ]
        }
      } else if (newActivity.type === 'electricity') {
        requestData = {
          type: 'electricity',
          electricity_unit: 'kwh',
          electricity_value: parseFloat(newActivity.distance),
          country: 'us'
        }
      } else {
        requestData = {
          type: 'shipping',
          weight_unit: 'kg',
          weight_value: parseFloat(newActivity.distance),
          distance_unit: 'km',
          distance_value: 100,
          transport_method: 'truck'
        }
      }

      const result = await carbonAPI.calculateEmissions(requestData)

      const activity = {
        id: Date.now(),
        type: newActivity.type,
        distance: parseFloat(newActivity.distance),
        co2_kg: result.data?.attributes?.carbon_kg || 0,
        date: new Date().toISOString()
      }

      setActivities(prev => [activity, ...prev])
      setNewActivity({ type: 'vehicle', distance: '', vehicle_model_id: 'a4091852-1e5a-4f7c-bb2d-9c3ccbf1b0e6' })
    } catch (error) {
      console.error('Error calculating emissions:', error)
      // Fallback calculation
      const fallbackCO2 = parseFloat(newActivity.distance) * 0.2 // rough estimate
      const activity = {
        id: Date.now(),
        type: newActivity.type,
        distance: parseFloat(newActivity.distance),
        co2_kg: fallbackCO2,
        date: new Date().toISOString()
      }
      setActivities(prev => [activity, ...prev])
      setNewActivity({ type: 'vehicle', distance: '', vehicle_model_id: 'a4091852-1e5a-4f7c-bb2d-9c3ccbf1b0e6' })
    } finally {
      setLoading(false)
    }
  }

  const totalCO2 = activities.reduce((sum, activity) => sum + activity.co2_kg, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Carbon Tracker</h1>
          <p className="text-lg text-gray-600">
            Monitor your carbon footprint and track your progress
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Add Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Add Activity</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Activity Type
                  </label>
                  <select
                    value={newActivity.type}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full p-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {activityTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {newActivity.type === 'electricity' ? 'Energy (kWh)' : 
                     newActivity.type === 'shipping' ? 'Weight (kg)' : 'Distance (km)'}
                  </label>
                  <input
                    type="number"
                    value={newActivity.distance}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, distance: e.target.value }))}
                    placeholder={`Enter ${newActivity.type === 'electricity' ? 'energy usage' : 
                                         newActivity.type === 'shipping' ? 'weight' : 'distance'}`}
                    className="w-full p-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <AnimatedButton
                  onClick={handleAddActivity}
                  disabled={loading || !newActivity.distance}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {loading ? 'Calculating...' : 'Add Activity'}
                </AnimatedButton>
              </div>
            </GlassCard>

            {/* Weekly Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6"
            >
              <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">This Week</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total CO₂</span>
                    <span className="font-bold text-red-600">{totalCO2.toFixed(1)}kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg. Daily</span>
                    <span className="font-bold text-orange-600">{(totalCO2 / 7).toFixed(1)}kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">vs Last Week</span>
                    <span className="font-bold text-green-600 flex items-center">
                      <TrendingDown className="w-4 h-4 mr-1" />
                      -12%
                    </span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>

          {/* Right Column - Activities & Chart */}
          <div className="lg:col-span-2 space-y-8">
            {/* Weekly Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Weekly CO₂ Emissions</h3>
                <div className="flex items-end justify-between h-32 space-x-2">
                  {weeklyData.map((value, index) => (
                    <motion.div
                      key={index}
                      initial={{ height: 0 }}
                      animate={{ height: `${(value / Math.max(...weeklyData)) * 100}%` }}
                      transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                      className="bg-gradient-to-t from-red-500 to-orange-400 rounded-t-lg flex-1 min-h-2"
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <span key={day}>{day}</span>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Recent Activities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activities</h3>
                <div className="space-y-4">
                  {activities.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-4xl mb-2">📊</div>
                      <p className="text-gray-600">No activities yet. Add your first activity!</p>
                    </div>
                  ) : (
                    activities.map((activity, index) => {
                      const activityType = activityTypes.find(t => t.id === activity.type)
                      return (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="flex items-center justify-between p-4 bg-white/30 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${activityType?.bgColor}`}>
                              <div className={activityType?.color}>
                                {activityType?.icon}
                              </div>
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">
                                {activityType?.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {activity.distance}{activity.type === 'electricity' ? 'kWh' : 
                                                   activity.type === 'shipping' ? 'kg' : 'km'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-red-600">
                              {activity.co2_kg.toFixed(1)}kg CO₂
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(activity.date).toLocaleDateString()}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })
                  )}
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}