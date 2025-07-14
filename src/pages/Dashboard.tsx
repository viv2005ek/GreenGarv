import React, { useState, useEffect } from 'react'
import { Calendar, Target, TrendingUp, Award, Leaf, Lock, Trophy, Star, Sparkles } from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'
import { EcoScoreRing } from '../components/charts/EcoScoreRing'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Background } from '../components/Background'
import { LoadingScreen } from './LoadingScreen'

interface CarbonActivity {
  activity_type: 'vehicle' | 'flight' | 'electricity' | 'shipping'
  co2_kg: number
  activity_date: string
}

interface UserScore {
  ecoScore: number
  co2Saved: number
  pointsEarned: number
  streakDays: number
  weeklyData: number[]
}

export function Dashboard() {
  const { user } = useAuth()
  const [userStats, setUserStats] = useState<UserScore>({
    ecoScore: 0,
    co2Saved: 0,
    pointsEarned: 0,
    streakDays: 0,
    weeklyData: []
  })
  const [recentActivities, setRecentActivities] = useState<CarbonActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [animatedStats, setAnimatedStats] = useState({
    ecoScore: 0,
    co2Saved: 0,
    pointsEarned: 0,
    streakDays: 0
  })
  const [progressAnimations, setProgressAnimations] = useState<{[key: number]: number}>({})

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return
      setLoading(true)

      try {
        // 1. Fetch user stats from user_scores
        const { data: scores, error: scoresError } = await supabase
          .from('user_scores')
          .select('eco_score, points_earned, streak_days, weekly_data, co2_saved')
          .eq('user_id', user.id)
          .single()

        if (scoresError) throw scoresError

        // 2. Calculate actual CO₂ savings from activities
        const { data: activities, error: activitiesError } = await supabase
          .from('carbon_activities')
          .select('co2_kg')
          .eq('user_id', user.id)

        if (activitiesError) throw activitiesError

        const calculatedCO2 = activities?.reduce((sum, item) => sum + (item.co2_kg || 0), 0) || 0

        // 3. Get recent activities for the feed
        const { data: recentActs } = await supabase
          .from('carbon_activities')
          .select('activity_type, co2_kg, activity_date')
          .eq('user_id', user.id)
          .order('activity_date', { ascending: false })
          .limit(3)

        setUserStats({
          ecoScore: scores?.eco_score || 0,
          co2Saved: calculatedCO2,
          pointsEarned: scores?.points_earned || 0,
          streakDays: scores?.streak_days || 0,
          weeklyData: scores?.weekly_data || []
        })

        setRecentActivities(recentActs || [])
      } catch (error) {
        console.error('Dashboard error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  // Animate stats from middle to actual values
  useEffect(() => {
    if (!loading) {
      const animateValue = (start: number, end: number, duration: number, key: keyof UserScore) => {
        const startTime = Date.now()
        const animate = () => {
          const elapsed = Date.now() - startTime
          const progress = Math.min(elapsed / duration, 1)
          
          // Easing function for smoother animation
          const easeOut = 1 - Math.pow(1 - progress, 3)
          const current = start + (end - start) * easeOut
          
          setAnimatedStats(prev => ({
            ...prev,
            [key]: key === 'ecoScore' ? Math.round(current) : Math.floor(current)
          }))
          
          if (progress < 1) {
            requestAnimationFrame(animate)
          }
        }
        requestAnimationFrame(animate)
      }

      // Start animations with delays
      setTimeout(() => animateValue(50, userStats.ecoScore, 2000, 'ecoScore'), 300)
      setTimeout(() => animateValue(userStats.co2Saved / 2, userStats.co2Saved, 1500, 'co2Saved'), 600)
      setTimeout(() => animateValue(userStats.pointsEarned / 2, userStats.pointsEarned, 1500, 'pointsEarned'), 900)
      setTimeout(() => animateValue(userStats.streakDays / 2, userStats.streakDays, 1500, 'streakDays'), 1200)
    }
  }, [loading, userStats])

  // Animate progress bars
  useEffect(() => {
    if (!loading) {
      weeklyGoals.forEach((goal, index) => {
        setTimeout(() => {
          const startTime = Date.now()
          const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / 2000, 1)
            const easeOut = 1 - Math.pow(1 - progress, 3)
            const current = goal.progress * easeOut
            
            setProgressAnimations(prev => ({
              ...prev,
              [index]: current
            }))
            
            if (progress < 1) {
              requestAnimationFrame(animate)
            }
          }
          requestAnimationFrame(animate)
        }, index * 400 + 800)
      })
    }
  }, [loading])

  const achievements = [
    { 
      title: 'Carbon Saver', 
      description: `Saved ${userStats.co2Saved}kg CO₂`, 
      icon: '🌍', 
      unlocked: userStats.co2Saved >= 100 
    },
    { 
      title: 'Eco Warrior', 
      description: `${userStats.streakDays}-day streak`, 
      icon: '⚡', 
      unlocked: userStats.streakDays >= 7 
    },
    { 
      title: 'Scanner Pro', 
      description: 'Scanned 10+ products', 
      icon: '📸', 
      unlocked: false
    },
    { 
      title: 'Recycling Champ', 
      description: 'Recycled 20+ items', 
      icon: '♻️', 
      unlocked: false
    }
  ]

  const weeklyGoals = [
    { 
      goal: 'Reduce carbon footprint', 
      progress: Math.min(100, Math.floor(userStats.ecoScore)), 
      color: 'bg-green-500' 
    },
    { 
      goal: 'Log 5 activities', 
      progress: Math.min(100, recentActivities.length * 20), 
      color: 'bg-blue-500' 
    },
    { 
      goal: 'Maintain streak', 
      progress: userStats.streakDays > 0 ? 100 : 0, 
      color: 'bg-purple-500' 
    }
  ]

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen text-white overflow-hidden mt-16 relative ">
      <Background />
      
      <div className="relative z-10 p-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 transform transition-all duration-1000 translate-y-0 opacity-100">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400 bg-clip-text text-transparent animate-pulse">
            Welcome, {user?.user_metadata?.name || 'Eco Champion'}!
          </h1>
          <p className="text-gray-300 transform transition-all duration-700 delay-300 relative ">
            Your sustainability dashboard • {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Eco Score */}
          <div className="lg:col-span-1 space-y-6">
            <GlassCard className="p-6 text-center hover:shadow-2xl hover:shadow-white/5 transition-all duration-500 hover:scale-[1.03] transform hover:-translate-y-2 group backdrop-blur-md flex flex-col items-center justify-center">
              <div className="relative z-10">
                <h2 className="text-xl font-bold mb-4 flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-green-400" />
                  Your Eco Score
                </h2>
                <EcoScoreRing score={animatedStats.ecoScore} animateFromCenter />
                <p className="text-gray-300 mt-4 transition-all duration-300 group-hover:text-white">
                  {animatedStats.ecoScore >= 80 ? 'Excellent! 🎉' : 
                  animatedStats.ecoScore >= 60 ? 'Good work! 💪' : 'Keep improving! 🌱'}
                </p>
              </div>
            </GlassCard>

            <GlassCard className="p-6 hover:shadow-2xl hover:shadow-white/5 transition-all duration-500 hover:scale-[1.03] transform hover:-translate-y-2 group backdrop-blur-md">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-400" /> Recent Activities
                </h3>
                <div className="space-y-3">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity, index) => (
                      <div
                        key={index}
                        className="flex justify-between hover:bg-white/10 p-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-white/10 hover:-translate-y-1 hover:scale-[1.02] cursor-pointer group/item backdrop-blur-sm"
                        style={{ animationDelay: `${index * 200}ms` }}
                      >
                        <span className="capitalize relative z-10">{activity.activity_type}</span>
                        <span className="text-green-400 font-medium relative z-10 flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          -{activity.co2_kg}kg CO₂
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-center py-8">
                      <Leaf className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No activities logged yet</p>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { 
                    title: 'CO₂ Saved', 
                    value: `${animatedStats.co2Saved}kg`, 
                    icon: <TrendingUp className="w-5 h-5" />,
                    color: 'text-green-400'
                  },
                  { 
                    title: 'Points', 
                    value: animatedStats.pointsEarned, 
                    icon: <Award className="w-5 h-5" />,
                    color: 'text-blue-400'
                  },
                  { 
                    title: 'Day Streak', 
                    value: animatedStats.streakDays, 
                    icon: <Calendar className="w-5 h-5" />,
                    color: 'text-purple-400'
                  }
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="hover:-translate-y-2 transition-all duration-300 transform"
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <GlassCard className={`p-4 hover:shadow-xl hover:shadow-white/5 transition-all duration-300 hover:scale-[1.05] group cursor-pointer backdrop-blur-md`}>
                      <div className="relative z-10">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-full bg-white/10 ${stat.color} group-hover:scale-110 transition-transform duration-300 group-hover:bg-white/20`}>
                            {stat.icon}
                          </div>
                          <div>
                            <div className={`text-2xl font-bold ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                              {stat.value}
                            </div>
                            <div className="text-sm text-gray-300 group-hover:text-white transition-colors duration-300">
                              {stat.title}
                            </div>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Progress */}
            <GlassCard className="p-6 hover:shadow-2xl hover:shadow-white/5 transition-all duration-500 hover:scale-[1.02] transform hover:-translate-y-1 group backdrop-blur-md">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-400" /> Weekly Goals
                </h3>
                <div className="space-y-4">
                  {weeklyGoals.map((goal, index) => (
                    <div key={index} className="group/goal">
                      <div className="flex justify-between mb-2">
                        <span className="group-hover/goal:text-white transition-colors duration-300">{goal.goal}</span>
                        <span className="font-bold">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden backdrop-blur-sm border border-white/10">
                        <div
                          className={`h-3 rounded-full ${goal.color} transition-all duration-1000 ease-out shadow-lg relative overflow-hidden`}
                          style={{ width: `${progressAnimations[index] || 0}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* Achievements */}
            <GlassCard className="p-6 hover:shadow-2xl hover:shadow-white/5 transition-all duration-500 hover:scale-[1.02] transform hover:-translate-y-1 group backdrop-blur-md">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" /> Achievements
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:scale-[1.05] cursor-pointer group/achievement backdrop-blur-sm ${
                        achievement.unlocked 
                          ? 'border-green-400/40 bg-green-400/20 hover:bg-green-400/30 hover:shadow-xl hover:shadow-white/10' 
                          : 'border-gray-700/50 bg-gray-800/30 hover:bg-gray-700/50 hover:shadow-xl hover:shadow-white/5'
                      }`}
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      {/* Trophy icon in top-right */}
                      <div className="absolute top-3 right-3 transition-all duration-300 group-hover/achievement:scale-110">
                        {achievement.unlocked ? (
                          <div className="relative">
                            <Trophy className="w-6 h-6 text-yellow-400 drop-shadow-lg" />
                            <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-ping" />
                          </div>
                        ) : (
                          <div className="relative">
                            <Trophy className="w-6 h-6 text-gray-500" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Lock className="w-4 h-4 text-gray-600" />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="relative z-10">
                        <div className="text-3xl mb-2 group-hover/achievement:scale-110 transition-transform duration-300">
                          {achievement.icon}
                        </div>
                        <h4 className="font-bold text-lg group-hover/achievement:text-white transition-colors duration-300">
                          {achievement.title}
                        </h4>
                        <p className="text-sm text-gray-400 group-hover/achievement:text-gray-300 transition-colors duration-300">
                          {achievement.description}
                        </p>
                      </div>
                      
                      {/* Locked overlay */}
                      {!achievement.unlocked && (
                        <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-gray-900/60 backdrop-blur-[2px] group-hover/achievement:bg-gray-900/40 transition-all duration-300">
                          <div className="text-center">
                            <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover/achievement:scale-110 transition-transform duration-300" />
                            <span className="text-xs text-gray-500 group-hover/achievement:text-gray-400 transition-colors duration-300">
                              Locked
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Sparkle effect for unlocked achievements */}
                      {achievement.unlocked && (
                        <div className="absolute top-2 left-2 opacity-0 group-hover/achievement:opacity-100 transition-opacity duration-300">
                          <Star className="w-4 h-4 text-yellow-300 animate-pulse" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* ElevenLabs Chatbot */}
          <elevenlabs-convai 
            agent-id="agent_01jzgjxm01eravnj2fe0mrzw4p"
          />
        </div>
    </div>
  )
}