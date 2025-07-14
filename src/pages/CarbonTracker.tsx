import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Car, Plane, Home, Utensils, Plus, TrendingDown, Leaf, Flame, Activity, Calendar, Loader } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Background } from '../components/Background';
import { LoadingScreen } from './LoadingScreen';

// Type definitions
type ActivityType = 'vehicle' | 'flight' | 'electricity' | 'shipping';

interface ActivityTypeConfig {
  id: ActivityType;
  name: string;
  icon: React.ReactNode;
  color: string;
  unit: string;
  endpoint: string;
}

interface VehicleModel {
  id: string;
  make: string;
  model: string;
  year: number;
  fuel_type: string;
  co2_per_km: number;
}

interface CarbonActivity {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  distance_value: number;
  co2_kg: number;
  activity_date: string;
  metadata: {
    [key: string]: any;
    calculated_at: string;
    source: 'carbon_interface' | 'fallback';
    co2_per_unit?: number;
    vehicle_make?: string;
    vehicle_model?: string;
    vehicle_year?: number;
  };
}

interface NewActivityState {
  type: ActivityType;
  distance: string;
  vehicle_model_id: string;
  metadata: {};
}

interface LoadingState {
  page: boolean;
  submit: boolean;
  chart: boolean;
  models: boolean;
}

// API configuration
const CARBON_INTERFACE_API_KEY = 'WHw5TawUGIvAb0x8S5a2w';
const CARBON_INTERFACE_URL = 'https://www.carboninterface.com/api/v1/estimates';

const activityTypes: ActivityTypeConfig[] = [
  { 
    id: 'vehicle', 
    name: 'Vehicle Travel', 
    icon: <Car className="w-5 h-5" />, 
    color: 'text-red-400',
    unit: 'km',
    endpoint: 'vehicle'
  },
  { 
    id: 'flight', 
    name: 'Air Travel', 
    icon: <Plane className="w-5 h-5" />, 
    color: 'text-blue-400',
    unit: 'km',
    endpoint: 'flight'
  },
  { 
    id: 'electricity', 
    name: 'Electricity', 
    icon: <Home className="w-5 h-5" />, 
    color: 'text-yellow-400',
    unit: 'kWh',
    endpoint: 'electricity'
  },
  { 
    id: 'shipping', 
    name: 'Shipping', 
    icon: <Utensils className="w-5 h-5" />, 
    color: 'text-green-400',
    unit: 'kg',
    endpoint: 'shipping'
  }
];

// Fallback CO2 estimates if API fails
const FALLBACK_ESTIMATES = {
  vehicle: 0.2,    // kg CO2 per km
  flight: 0.18,    // kg CO2 per km
  electricity: 0.5, // kg CO2 per kWh
  shipping: 0.1     // kg CO2 per kg
};

export const CarbonTracker: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<CarbonActivity[]>([]);
  const [newActivity, setNewActivity] = useState<NewActivityState>({
    type: 'vehicle',
    distance: '',
    vehicle_model_id: '',
    metadata: {}
  });
  const [loading, setLoading] = useState<LoadingState>({
    page: true,
    submit: false,
    chart: true,
    models: true
  });
  const [weeklyData, setWeeklyData] = useState<number[]>([]);
  const [totalCO2, setTotalCO2] = useState<number>(0);
  const [animatedCO2, setAnimatedCO2] = useState<number>(0);
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's carbon activities and vehicle models
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setLoading(prev => ({ ...prev, page: true, models: true }));
        
        // Fetch vehicle models from Supabase
        const { data: models, error: modelsError } = await supabase
          .from('vehicle_models')
          .select('*');
        
        if (modelsError) throw modelsError;
        
        setVehicleModels(models as VehicleModel[] || []);
        
        // Set default vehicle if models exist
        if (models && models.length > 0) {
          setNewActivity(prev => ({
            ...prev,
            vehicle_model_id: models[0].id
          }));
        }
        
        // Fetch user activities
        const { data: activities, error: activitiesError } = await supabase
          .from('carbon_activities')
          .select('*')
          .eq('user_id', user.id)
          .order('activity_date', { ascending: false });
        
        if (activitiesError) throw activitiesError;
        
        setActivities(activities as CarbonActivity[] || []);
        
        // Calculate total CO2
        const total = activities?.reduce((sum: number, item: CarbonActivity) => sum + (item.co2_kg || 0), 0) || 0;
        setTotalCO2(total);
        
        // Generate weekly data (last 7 days)
        const today = new Date();
        const weekly = Array(7).fill(0).map((_, i) => {
          const date = new Date(today);
          date.setDate(date.getDate() - (6 - i));
          return activities?.filter((a: CarbonActivity) => {
            const d = new Date(a.activity_date);
            return d.getDate() === date.getDate() && 
                   d.getMonth() === date.getMonth() && 
                   d.getFullYear() === date.getFullYear();
          }).reduce((sum: number, a: CarbonActivity) => sum + a.co2_kg, 0) || 0;
        });
        setWeeklyData(weekly);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(prev => ({ ...prev, page: false, chart: false, models: false }));
      }
    };
    
    fetchData();
  }, [user]);

  // Animate CO2 value
  useEffect(() => {
    const animateValue = (start: number, end: number, duration: number) => {
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = start + (end - start) * easeOut;
        setAnimatedCO2(Math.floor(current * 10) / 10);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    };
    
    animateValue(0, totalCO2, 1500);
  }, [totalCO2]);

  const calculateEmissions = async (activityData: any): Promise<number> => {
    try {
      const response = await fetch(CARBON_INTERFACE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CARBON_INTERFACE_API_KEY}`
        },
        body: JSON.stringify(activityData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data.attributes.carbon_kg as number;
    } catch (err) {
      console.error('Error calculating emissions:', {
        error: (err as Error).message,
        activityData,
        timestamp: new Date().toISOString()
      });
      
      // Use fallback estimate with warning
      console.warn('Using fallback CO2 estimate');
      return activityData.distance_value * FALLBACK_ESTIMATES[activityData.type as ActivityType];
    }
  };

  const handleAddActivity = async () => {
    if (!newActivity.distance || !user) return;
    if (newActivity.type === 'vehicle' && !newActivity.vehicle_model_id) {
      setError('Please select a vehicle model');
      return;
    }

    setLoading(prev => ({ ...prev, submit: true }));
    setError(null);
    
    try {
      const distance = parseFloat(newActivity.distance);
      let requestData: any = {};
      let co2Estimate = 0;
      
      // Get selected vehicle model for metadata
      const selectedVehicle = vehicleModels.find(
        model => model.id === newActivity.vehicle_model_id
      );
      
      // Prepare request data based on activity type
      switch(newActivity.type) {
        case 'vehicle':
          requestData = {
            type: 'vehicle',
            distance_unit: 'km',
            distance_value: distance,
            vehicle_model_id: newActivity.vehicle_model_id,
            vehicle_make: selectedVehicle?.make,
            vehicle_model: selectedVehicle?.model,
            vehicle_year: selectedVehicle?.year
          };
          break;
        case 'flight':
          requestData = {
            type: 'flight',
            passengers: 1,
            legs: [{
              departure_airport: 'LHR',
              destination_airport: 'JFK',
              cabin_class: 'economy'
            }]
          };
          break;
        case 'electricity':
          requestData = {
            type: 'electricity',
            electricity_unit: 'kwh',
            electricity_value: distance,
            country: 'us',
            state: 'ny'
          };
          break;
        case 'shipping':
          requestData = {
            type: 'shipping',
            weight_unit: 'kg',
            weight_value: distance,
            distance_unit: 'km',
            distance_value: 100,
            transport_method: 'truck'
          };
          break;
        default:
          throw new Error('Invalid activity type');
      }
      
      // Calculate emissions using Carbon Interface API
      co2Estimate = await calculateEmissions(requestData);
      
      // Prepare metadata for Supabase
      const activityMetadata = {
        ...requestData,
        calculated_at: new Date().toISOString(),
        source: co2Estimate === distance * FALLBACK_ESTIMATES[newActivity.type] ? 'fallback' : 'carbon_interface',
        co2_per_unit: co2Estimate / distance
      };
      
      // Save to Supabase
      const { data, error } = await supabase
        .from('carbon_activities')
        .insert([{
          user_id: user.id,
          activity_type: newActivity.type,
          distance_value: distance,
          co2_kg: co2Estimate,
          metadata: activityMetadata
        }])
        .select();
      
      if (error) throw error;
      
      // Update local state
      setActivities(prev => [data[0] as CarbonActivity, ...prev]);
      setTotalCO2(prev => prev + co2Estimate);
      setNewActivity({ 
        type: 'vehicle', 
        distance: '', 
        vehicle_model_id: vehicleModels[0]?.id || '', // Reset to first vehicle
        metadata: {} 
      });
      
      // Update weekly data
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
      setWeeklyData(prev => {
        const newWeekly = [...prev];
        newWeekly[dayOfWeek === 0 ? 6 : dayOfWeek - 1] += co2Estimate;
        return newWeekly;
      });
      
      // Update user's eco score
      await updateUserScore(co2Estimate);
    } catch (err) {
      console.error('Error saving activity:', {
        error: (err as Error).message,
        newActivity,
        timestamp: new Date().toISOString()
      });
      setError('Failed to save activity. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const updateUserScore = async (co2Saved: number) => {
    if (!user) return;
    
    try {
      // Get current score
      const { data: currentScore, error: scoreError } = await supabase
        .from('user_scores')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (scoreError) throw scoreError;
      
      // Calculate new score
      const newEcoScore = Math.min(100, (currentScore?.eco_score || 0) + 1);
      const newPoints = (currentScore?.points_earned || 0) + Math.floor(co2Saved);
      
      // Update score
      const { error } = await supabase
        .from('user_scores')
        .upsert({
          id: currentScore?.id || undefined,
          user_id: user.id,
          eco_score: newEcoScore,
          co2_saved: (currentScore?.co2_saved || 0) + co2Saved,
          points_earned: newPoints,
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
    } catch (err) {
      console.error('Error updating user score:', {
        error: (err as Error).message,
        userId: user.id,
        timestamp: new Date().toISOString()
      });
    }
  };

  if (loading.page) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen text-white overflow-hidden mt-16 relative">
      <Background />
      
      <div className="relative z-10 p-4 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400 bg-clip-text text-transparent">
            Carbon Tracker
          </h1>
          <p className="text-gray-300">
            Monitor your carbon footprint and track your progress
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-400 rounded-xl"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{error}</span>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Add Activity */}
          <div className="lg:col-span-1 space-y-6">
            <GlassCard className="p-6 hover:shadow-2xl hover:shadow-white/5 transition-all duration-500 hover:scale-[1.03] transform hover:-translate-y-2 group backdrop-blur-md">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 justify-center">
                <Plus className=" text-green-400" />
                Log Activity
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Activity Type
                  </label>
                  <select
                    value={newActivity.type}
                    onChange={(e) => setNewActivity(prev => ({ 
                      ...prev, 
                      type: e.target.value as ActivityType,
                      vehicle_model_id: e.target.value === 'vehicle' ? (vehicleModels[0]?.id || '') : ''
                    }))}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                  >
                    {activityTypes.map(type => (
                      <option key={type.id} value={type.id} className="bg-gray-800">
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                {newActivity.type === 'vehicle' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Vehicle Model
                    </label>
                    {loading.models ? (
                      <div className="p-3 bg-white/10 rounded-xl flex justify-center">
                        <Loader className="animate-spin" />
                      </div>
                    ) : (
                      <select
                        value={newActivity.vehicle_model_id}
                        onChange={(e) => setNewActivity(prev => ({ 
                          ...prev, 
                          vehicle_model_id: e.target.value 
                        }))}
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
                        disabled={loading.submit}
                      >
                        {vehicleModels.length > 0 ? (
                          vehicleModels.map(model => (
                            <option key={model.id} value={model.id} className="bg-gray-800">
                              {model.make} {model.model} ({model.year}) - {model.co2_per_km}kg/km
                            </option>
                          ))
                        ) : (
                          <option value="" disabled className="bg-gray-800">
                            No vehicle models available
                          </option>
                        )}
                      </select>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {activityTypes.find(t => t.id === newActivity.type)?.unit.toUpperCase()}
                  </label>
                  <input
                    type="number"
                    value={newActivity.distance}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, distance: e.target.value }))}
                    placeholder={`Enter ${activityTypes.find(t => t.id === newActivity.type)?.unit}`}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400"
                    disabled={loading.submit}
                    min="0"
                    step="0.1"
                  />
                </div>

               <AnimatedButton
  onClick={handleAddActivity}
  disabled={loading.submit || !newActivity.distance || (newActivity.type === 'vehicle' && !newActivity.vehicle_model_id)}
  className="w-full group-hover:shadow-lg group-hover:shadow-green-400/20 relative overflow-hidden cursor-pointer"
>
  {/* Carbon/energy pulse animation (hidden until hover) */}
  <span className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#00ffaa_0%,_transparent_70%)] opacity-0 group-hover:opacity-20 group-hover:scale-150 transition-all duration-700"></span>
  
  {/* Lightning bolt animation (hidden until hover) */}
  <span className="absolute h-[200%] w-1 bg-white/30 left-1/4 -translate-x-1/2 -top-1/2 group-hover:top-[150%] transition-all duration-500"></span>
  <span className="absolute h-[200%] w-1 bg-white/30 left-2/4 -translate-x-1/2 -top-1/2 group-hover:top-[150%] transition-all duration-700"></span>
  <span className="absolute h-[200%] w-1 bg-white/30 left-3/4 -translate-x-1/2 -top-1/2 group-hover:top-[150%] transition-all duration-900"></span>

  <span className="relative z-10 flex items-center justify-center gap-2">
    {loading.submit ? (
      <>
        <Loader className="w-5 h-5 animate-spin" />
        <span>Calculating...</span>
      </>
    ) : (
      <>
        <Plus className="w-5 h-5 group-hover:scale-110 group-hover:text-green-300 transition-transform" />
        <span className="group-hover:font-medium">Log Activity</span>
      </>
    )}
  </span>
</AnimatedButton>
              </div>
            </GlassCard>

            {/* Weekly Summary */}
            <GlassCard className="p-6 hover:shadow-2xl hover:shadow-white/5 transition-all duration-500 hover:scale-[1.03] transform hover:-translate-y-2 group backdrop-blur-md">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                Weekly Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center hover:bg-white/10 p-2 rounded-lg transition-colors duration-300">
                  <span className="text-gray-300">Total CO₂</span>
                  <span className="font-bold text-red-400">{animatedCO2.toFixed(1)}kg</span>
                </div>
                <div className="flex justify-between items-center hover:bg-white/10 p-2 rounded-lg transition-colors duration-300">
                  <span className="text-gray-300">Activities</span>
                  <span className="font-bold text-blue-400">{activities.length}</span>
                </div>
                <div className="flex justify-between items-center hover:bg-white/10 p-2 rounded-lg transition-colors duration-300">
                  <span className="text-gray-300">Avg. Daily</span>
                  <span className="font-bold text-yellow-400">
                    {(activities.length > 0 ? (totalCO2 / 7) : 0).toFixed(1)}kg
                  </span>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Right Column - Activities & Chart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weekly Chart */}
            <GlassCard className="p-6 hover:shadow-2xl hover:shadow-white/5 transition-all duration-500 hover:scale-[1.02] transform hover:-translate-y-1 group backdrop-blur-md">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-400" />
                Weekly CO₂ Emissions
              </h3>
              {loading.chart ? (
                <div className="h-40 flex items-center justify-center">
                  <Loader className="animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="flex items-end justify-between h-40 space-x-2 mt-4">
                  {weeklyData.map((value, index) => {
                    const maxValue = Math.max(...weeklyData, 1);
                    const heightPercentage = (value / maxValue) * 100;
                    return (
                      <motion.div
                        key={index}
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercentage}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="bg-gradient-to-t from-red-500 to-orange-400 rounded-t-lg flex-1 min-h-2 relative overflow-hidden group/bar"
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover/bar:opacity-100 transition-opacity duration-300" />
                        <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-gray-400">
                          {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                        </div>
                        <div className="absolute -top-8 left-0 right-0 text-center text-sm font-medium opacity-0 group-hover/bar:opacity-100 transition-opacity duration-300">
                          {value.toFixed(1)}kg
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </GlassCard>

            {/* Recent Activities */}
            <GlassCard className="p-6 hover:shadow-2xl hover:shadow-white/5 transition-all duration-500 hover:scale-[1.02] transform hover:-translate-y-1 group backdrop-blur-md">
  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
    <Flame className="w-5 h-5 text-orange-400" />
    Recent Activities
  </h3>
  <div className="space-y-3 max-h-[400px] overflow-y-auto"> {/* Added max-height and overflow */}
    {activities.length === 0 ? (
      <div className="text-center py-8">
        <Leaf className="w-12 h-12 mx-auto mb-2 text-gray-500" />
        <p className="text-gray-400">No activities logged yet</p>
        <p className="text-gray-500 text-sm mt-2">Add your first activity to track your carbon footprint</p>
      </div>
    ) : (
      activities.map((activity, index) => {
        const activityType = activityTypes.find(t => t.id === activity.activity_type);
        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors duration-300 cursor-pointer"
            onClick={() => console.log('Activity details:', activity)}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-white/10 ${activityType?.color}`}>
                {activityType?.icon}
              </div>
              <div>
                <div className="font-bold">
                  {activityType?.name}
                  {activity.activity_type === 'vehicle' && activity.metadata.vehicle_model && (
                    <span className="text-xs text-gray-400 ml-2">
                      ({activity.metadata.vehicle_make} {activity.metadata.vehicle_model})
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-400">
                  {activity.distance_value}{activityType?.unit} • {new Date(activity.activity_date).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-red-400">
                {activity.co2_kg.toFixed(1)}kg CO₂
              </div>
              <div className="text-xs text-gray-400">
                {new Date(activity.activity_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </motion.div>
        );
      })
    )}
  </div>
</GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};