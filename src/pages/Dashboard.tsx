import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Target, TrendingUp, Award, MessageCircle } from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'
import { EcoScoreRing } from '../components/charts/EcoScoreRing'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export function Dashboard() {
  const { user } = useAuth()
  const [userStats, setUserStats] = useState({
    ecoScore: 0,
    co2Saved: 0,
    pointsEarned: 0,
    streakDays: 0,
    weeklyData: []
  })
  const [showChatbot, setShowChatbot] = useState(false)

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('user_scores')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (data) {
          setUserStats(data)
        }
      } catch (error) {
        console.error('Error fetching user stats:', error)
        // Fallback to demo data
        setUserStats({
          ecoScore: 78,
          co2Saved: 245,
          pointsEarned: 1340,
          streakDays: 12,
          weeklyData: [65, 68, 72, 75, 78, 76, 78]
        })
      }
    }

    fetchUserStats()
  }, [user])

  const achievements = [
    { title: 'Carbon Saver', description: 'Saved 100kg CO₂', icon: '🌍', unlocked: true },
    { title: 'Eco Warrior', description: '30-day streak', icon: '⚡', unlocked: true },
    { title: 'Plant Parent', description: 'Planted 5 trees', icon: '🌱', unlocked: false },
    { title: 'Waste Reducer', description: 'Reduced waste by 50%', icon: '♻️', unlocked: false }
  ]

  const weeklyGoals = [
    { goal: 'Reduce car usage by 30%', progress: 85, color: 'bg-green-500' },
    { goal: 'Use reusable bags', progress: 100, color: 'bg-blue-500' },
    { goal: 'Recycle 10 items', progress: 60, color: 'bg-purple-500' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Eco Champion'}!
          </h1>
          <p className="text-lg text-gray-600">
            Here's your sustainability overview for today
          </p>
        </motion.div>

        {/* Main Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Eco Score */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <GlassCard className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Eco Score</h2>
              <EcoScoreRing score={userStats.ecoScore} />
              <p className="text-gray-600 mt-4">
                Keep up the great work! You're in the top 25% of eco-conscious users.
              </p>
            </GlassCard>
          </motion.div>

          {/* Right Column - Stats & Goals */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { 
                    title: 'CO₂ Saved', 
                    value: `${userStats.co2Saved}kg`, 
                    icon: <TrendingUp className="w-6 h-6" />,
                    color: 'text-green-600',
                    bgColor: 'bg-green-100'
                  },
                  { 
                    title: 'Points Earned', 
                    value: userStats.pointsEarned.toLocaleString(), 
                    icon: <Award className="w-6 h-6" />,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-100'
                  },
                  { 
                    title: 'Streak Days', 
                    value: userStats.streakDays, 
                    icon: <Calendar className="w-6 h-6" />,
                    color: 'text-purple-600',
                    bgColor: 'bg-purple-100'
                  }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <GlassCard className="p-6" hover>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                          <div className={stat.color}>{stat.icon}</div>
                        </div>
                      </div>
                      <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-600">{stat.title}</div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Weekly Goals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Target className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-bold text-gray-900">Weekly Goals</h3>
                </div>
                <div className="space-y-4">
                  {weeklyGoals.map((goal, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">{goal.goal}</span>
                        <span className="text-sm font-bold">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className={`h-2 rounded-full ${goal.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${goal.progress}%` }}
                          transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Award className="w-6 h-6 text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-900">Achievements</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.title}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        achievement.unlocked 
                          ? 'border-green-300 bg-green-50' 
                          : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="text-2xl mb-2">{achievement.icon}</div>
                      <h4 className="font-bold text-gray-900 mb-1">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>

        {/* AI Chatbot Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <GlassCard 
            className="p-4 cursor-pointer" 
            hover
            onClick={() => setShowChatbot(!showChatbot)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">EcoBot</div>
                <div className="text-xs text-gray-600">Ask me anything!</div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* ElevenLabs Chatbot */}
        {showChatbot && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed bottom-24 right-6 z-50"
          >
            <GlassCard className="p-4 w-80 h-96">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">EcoBot Assistant</h3>
                <button
                  onClick={() => setShowChatbot(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="h-full">
                <elevenlabs-convai agent-id="agent_01jzgjxm01eravnj2fe0mrzw4p"></elevenlabs-convai>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  )
}