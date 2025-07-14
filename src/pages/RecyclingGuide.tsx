/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Recycle, Trash2, Package, Zap, HardDrive, Scissors, Award, Info, X } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import { useAuth } from '../hooks/useAuth';
import { Background } from '../components/Background';
import { LoadingScreen } from './LoadingScreen';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface RecyclingCenter {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  accepted_materials: string[];
}

interface RecyclingCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  tips: string;
  items?: RecyclingItem[];
  examples?: string;
  detailedTips?: string[];
}

interface RecyclingItem {
  id: string;
  name: string;
  description: string;
  recycling_tips: string;
  reusability: string;
  image_url?: string;
}

export function RecyclingGuide() {
  const { user } = useAuth();
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [recyclingCenters, setRecyclingCenters] = useState<RecyclingCenter[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<RecyclingCategory | null>(null);
  const [selectedItem, setSelectedItem] = useState<RecyclingItem | null>(null);
  const [categories, setCategories] = useState<RecyclingCategory[]>([]);
  const [currentRadiusIndex, setCurrentRadiusIndex] = useState(0);
  const [mapInitialized, setMapInitialized] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Radius options (in meters)
  const radii = [50000, 100000, 200000, 300000, 400000, 500000, 600000];

  // Define colors for each category
  const categoryColors = {
    glass: "#4285F4",
    paper: "#34A853",
    plastic: "#FBBC05",
    metal: "#EA4335",
    textiles: "#9C27B0",
    electronics: "#00BCD4",
    others: "#757575"
  };

  const categoryBgColors = {
    glass: "bg-blue-400/10",
    paper: "bg-green-400/10",
    plastic: "bg-yellow-400/10",
    metal: "bg-orange-400/10",
    textiles: "bg-pink-400/10",
    electronics: "bg-purple-400/10",
    others: "bg-gray-400/10"
  };

  // Initialize categories with detailed information
  useEffect(() => {
    const initialCategories: RecyclingCategory[] = [
      {
        id: '1',
        name: 'Glass',
        description: 'Glass can be recycled endlessly without loss of quality.',
        icon: '🍶',
        color: 'text-blue-400',
        tips: 'Rinse containers before recycling. Separate by color if required.',
        examples: 'Beer bottles, wine bottles, jam jars, pickle jars, sauce bottles',
        detailedTips: [
          'Remove caps and lids before recycling',
          'Rinse containers to remove food residue',
          'Don\'t break glass before recycling',
          'Separate by color if required in your area',
          'Don\'t include light bulbs or window glass'
        ]
      },
      {
        id: '2',
        name: 'Paper',
        description: 'Recycling paper saves trees and reduces landfill waste.',
        icon: '📄',
        color: 'text-green-400',
        tips: 'Keep paper dry and clean. Remove any plastic or metal components.',
        examples: 'Newspapers, magazines, office paper, cereal boxes, pizza boxes (if not greasy)',
        detailedTips: [
          'Remove any plastic windows from envelopes',
          'Flatten cardboard boxes to save space',
          'Don\'t recycle wet or food-soiled paper',
          'Separate different types of paper when possible',
          'Remove staples and paper clips when feasible'
        ]
      },
      {
        id: '3',
        name: 'Plastic',
        description: 'Recycling plastic helps reduce pollution and conserve resources.',
        icon: '♻️',
        color: 'text-yellow-400',
        tips: 'Clean containers before recycling. Check resin codes for recyclability.',
        examples: 'Water bottles, soda bottles, milk jugs, yogurt containers, detergent bottles',
        detailedTips: [
          'Check the recycling number on the bottom',
          'Rinse containers to remove food residue',
          'Remove caps and lids (recycle separately if possible)',
          'Don\'t bag plastic items unless specified',
          'Crush bottles to save space'
        ]
      },
      {
        id: '4',
        name: 'Metal',
        description: 'Metal recycling saves energy and reduces mining impacts.',
        icon: '🔩',
        color: 'text-orange-400',
        tips: 'Clean cans before recycling. Separate aluminum and steel if possible.',
        examples: 'Aluminum cans, steel cans, tin cans, aluminum foil (clean), empty aerosol cans',
        detailedTips: [
          'Rinse cans to remove food residue',
          'Remove paper labels if easily removable',
          'Crush cans to save space',
          'Don\'t include aerosol cans unless completely empty',
          'Separate aluminum from steel if required'
        ]
      },
      {
        id: '5',
        name: 'Textiles',
        description: 'Textile recycling reduces landfill waste and water usage.',
        icon: '👕',
        color: 'text-pink-400',
        tips: 'Donate wearable items. Recycle damaged fabrics separately.',
        examples: 'Clothing, shoes, handbags, bed sheets, towels, curtains',
        detailedTips: [
          'Clean items before donating/recycling',
          'Separate good condition items for donation',
          'Pair shoes together',
          'Remove non-textile elements (zippers, buttons) if required',
          'Consider textile recycling programs at retail stores'
        ]
      },
      {
        id: '6',
        name: 'Electronics',
        description: 'E-waste contains valuable materials and hazardous substances.',
        icon: '💻',
        color: 'text-purple-400',
        tips: 'Never throw in regular trash. Find certified e-waste recyclers.',
        examples: 'Smartphones, laptops, tablets, printers, televisions, gaming consoles',
        detailedTips: [
          'Remove all personal data before recycling',
          'Include chargers and cables',
          'Remove batteries if possible',
          'Find certified e-waste recyclers',
          'Consider donation if items still work'
        ]
      },
      {
        id: '7',
        name: 'Others',
        description: 'Miscellaneous items that require special recycling.',
        icon: '🗑️',
        color: 'text-gray-400',
        tips: 'Check local guidelines for specific disposal instructions.',
        examples: 'Batteries, paint, chemicals, motor oil, light bulbs',
        detailedTips: [
          'Check local hazardous waste collection events',
          'Never mix different types of waste',
          'Store items safely until proper disposal',
          'Contact local authorities for guidance',
          'Look for manufacturer take-back programs'
        ]
      }
    ];
    setCategories(initialCategories);
  }, []);

  // Calculate distance between two points
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Initialize map
  const initializeMap = () => {
    if (!location || mapInitialized || !mapRef.current) return;

  

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    const map = L.map(mapRef.current).setView([location.lat, location.lon], 12);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Add user location marker
    L.marker([location.lat, location.lon]).addTo(map).bindPopup("📍 You are here").openPopup();

    setMapInitialized(true);
  };

  // Create legend for map
  const createLegend = () => {
    const legend = document.createElement('div');
    legend.className = 'absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg text-sm z-[1000]';
    legend.innerHTML = `
      <div class="font-bold text-gray-800 mb-2">Recycling Types</div>
      ${Object.entries(categoryColors).map(([type, color]) => 
        type !== 'others' ? `<div class="flex items-center mb-1">
          <div class="w-3 h-3 rounded-full mr-2" style="background-color: ${color}"></div>
          <span class="text-gray-700 capitalize">${type}</span>
        </div>` : ''
      ).join('')}
    `;
    
    if (mapRef.current) {
      mapRef.current.appendChild(legend);
    }
  };

  // Fetch recycling centers from OpenStreetMap
  const fetchRecyclingCenters = async () => {
  if (!location) return;

  const radius = radii[currentRadiusIndex];
  setLoading(true);

  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="recycling"](around:${radius},${location.lat},${location.lon});
      way["amenity"="recycling"](around:${radius},${location.lat},${location.lon});
      relation["amenity"="recycling"](around:${radius},${location.lat},${location.lon});
    );
    out center;
  `;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: new URLSearchParams({ data: query })
    });

    const data = await response.json();
    
    // Clear previous markers
    markersRef.current.forEach(marker => mapInstanceRef.current?.removeLayer(marker));
    markersRef.current = [];

    if (data.elements && data.elements.length > 0) {
      const centers: RecyclingCenter[] = data.elements.map((el: any, index: number) => {
        const elLat = el.lat || el.center?.lat;
        const elLon = el.lon || el.center?.lon;
        
        if (!elLat || !elLon) return null;

        const tags = el.tags || {};
        const acceptedMaterials = [];
        
        // Check what materials are accepted
        if (tags["recycling:glass"]) acceptedMaterials.push("glass");
        if (tags["recycling:paper"]) acceptedMaterials.push("paper");
        if (tags["recycling:plastic"]) acceptedMaterials.push("plastic");
        if (tags["recycling:metal"]) acceptedMaterials.push("metal");
        if (tags["recycling:textiles"]) acceptedMaterials.push("textiles");
        if (tags["recycling:electronics"]) acceptedMaterials.push("electronics");

        const recyclingType = acceptedMaterials[0] || "others";
        const color = categoryColors[recyclingType as keyof typeof categoryColors] || categoryColors.others;
        const name = tags.name || `Recycling Center #${index + 1}`;
        const distance = getDistance(location.lat, location.lon, elLat, elLon);

        // Add marker to map
        if (mapInstanceRef.current) {
          const marker = L.circleMarker([elLat, elLon], {
            radius: 7,
            fillColor: color,
            fillOpacity: 0.9,
            color: "#222",
            weight: 1
          }).addTo(mapInstanceRef.current)
            .bindPopup(`
              <div class="text-gray-800">
                <h3 class="font-bold">${name}</h3>
                <p class="text-sm">Type: ${recyclingType}</p>
                <p class="text-sm">Distance: ${distance.toFixed(2)} km</p>
                ${acceptedMaterials.length > 0 ? `
                  <div class="mt-2">
                    <div class="text-xs font-bold">Accepts:</div>
                    <div class="flex flex-wrap gap-1 mt-1">
                      ${acceptedMaterials.map(material => 
                        `<span class="text-xs px-2 py-1 bg-gray-100 rounded-full">${material}</span>`
                      ).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>
            `);
          
          markersRef.current.push(marker);
        }

        return {
          id: el.id?.toString() || index.toString(),
          name,
          address: tags.addr || 'Local area',
          latitude: elLat,
          longitude: elLon,
          accepted_materials: acceptedMaterials
        };
      }).filter(Boolean);

      setRecyclingCenters(centers);
      createLegend();
    } else {
      setRecyclingCenters([]);
    }
  } catch (error) {
    console.error('Error fetching recycling centers:', error);
  } finally {
    setLoading(false);
  }
};

  // Get user location
  const getLocation = async () => {
    setLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lon: longitude });
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLoading(false);
          alert('Unable to get your location. Please check your browser permissions.');
        },
        { enableHighAccuracy: true }
      );
    } else {
      setLoading(false);
      alert('Geolocation is not supported by this browser');
    }
  };

  // Initialize map when location is available
  useEffect(() => {
    if (location && !mapInitialized) {
      initializeMap();
    }
  }, [location, mapInitialized]);

  // Fetch centers when location or radius changes
  useEffect(() => {
    if (location && mapInitialized) {
      fetchRecyclingCenters();
    }
  }, [location, currentRadiusIndex, mapInitialized]);

  const increaseRadius = () => {
    if (currentRadiusIndex < radii.length - 1) {
      setCurrentRadiusIndex(currentRadiusIndex + 1);
    }
  };

  const openDirections = (lat: number, lon: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
    window.open(url, '_blank');
  };

  const quickTips = [
    'Always clean containers before recycling',
    'Check local recycling guidelines - rules vary by location',
    'When in doubt, throw it out (in regular trash)',
    'Reduce and reuse before recycling',
    'Look for recycling symbols and numbers on plastic items'
  ];

  // Handle category click - show detailed modal
  const handleCategoryClick = (category: RecyclingCategory) => {
    setSelectedCategory(category);
    setSelectedItem(null);
  };

  const handleItemClick = (item: RecyclingItem) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedCategory(null);
    setSelectedItem(null);
  };

  if (loading && !location) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen text-white overflow-hidden relative mt-16">
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
            Recycling Guide
          </h1>
          <p className="text-gray-300">
            Find recycling centers and learn proper disposal methods
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Find Centers and Quick Tips */}
          <div className="lg:col-span-1 space-y-6">
            <GlassCard className="p-6 hover:shadow-2xl hover:shadow-white/5 transition-all duration-500 hover:scale-[1.03] transform hover:-translate-y-2 group backdrop-blur-md">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-400" />
                Find Recycling Centers
              </h2>
              
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
                  <div className="text-sm text-gray-300">
                    <p>📍 Current location: {location.lat.toFixed(4)}, {location.lon.toFixed(4)}</p>
                    <p>🔍 Search radius: {Math.round(radii[currentRadiusIndex] / 1000)} km</p>
                  </div>
                )}

                {location && (
                  <AnimatedButton
                    onClick={increaseRadius}
                    disabled={currentRadiusIndex >= radii.length - 1}
                    className="w-full"
                    variant="secondary"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Increase Search Radius
                  </AnimatedButton>
                )}
              </div>
            </GlassCard>

            {/* Nearby Centers */}
            {recyclingCenters.length > 0 && (
              <GlassCard className="p-6 hover:shadow-2xl hover:shadow-white/5 transition-all duration-500 hover:scale-[1.03] transform hover:-translate-y-2 group backdrop-blur-md">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Recycle className="w-5 h-5 text-green-400" />
                  Nearby Centers ({recyclingCenters.length})
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recyclingCenters.map((center, index) => (
                    <motion.div
                      key={center.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-start gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors duration-300 cursor-pointer"
                      onClick={() => openDirections(center.latitude, center.longitude)}
                    >
                      <div className="w-8 h-8 bg-green-100/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{center.name}</div>
                        <div className="text-sm text-gray-300">{center.address}</div>
                        <div className="text-sm text-gray-400">
                          Distance: {getDistance(location!.lat, location!.lon, center.latitude, center.longitude).toFixed(2)} km
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {center.accepted_materials.map((material, i) => (
                            <span key={i} className="text-xs px-2 py-1 bg-white/10 rounded-full">
                              {material}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Quick Tips */}
            <GlassCard className="p-6 hover:shadow-2xl hover:shadow-white/5 transition-all duration-500 hover:scale-[1.03] transform hover:-translate-y-2 group backdrop-blur-md">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" />
                Quick Tips
              </h3>
              <ul className="space-y-3">
                {quickTips.map((tip, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-start gap-2 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-300"
                  >
                    <span className="text-green-400 mt-1">•</span>
                    <span className="text-gray-300">{tip}</span>
                  </motion.li>
                ))}
              </ul>
            </GlassCard>
          </div>

          {/* Right Column - Map and Categories */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map */}
            <GlassCard className="p-0 overflow-hidden h-96 hover:shadow-2xl hover:shadow-white/5 transition-all duration-500 hover:scale-[1.02] transform hover:-translate-y-1 group backdrop-blur-md">
              <div className="relative">
                <div ref={mapRef} className="h-96 w-full rounded-xl">
                  {!location && (
                    <div className="h-full w-full bg-gray-800/20 flex items-center justify-center">
                      <div className="text-center p-6">
                        <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-300 mb-4">Enable location to view recycling centers</p>
                        <AnimatedButton onClick={getLocation} disabled={loading}>
                          <MapPin className="w-4 h-4 mr-2" />
                          {loading ? 'Finding...' : 'Find Centers'}
                        </AnimatedButton>
                      </div>
                    </div>
                  )}
                </div>
                {location && (
                  <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
                    {loading ? 'Searching...' : `${recyclingCenters.length} centers found`}
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Recycling Categories */}
            <GlassCard className="p-6 hover:shadow-2xl hover:shadow-white/5 transition-all duration-500 hover:scale-[1.02] transform hover:-translate-y-1 group backdrop-blur-md">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Recycle className="w-6 h-6 text-green-400" />
                Recycling Categories
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category, index) => (
  <motion.div
    key={category.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 * index }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => handleCategoryClick(category)} // Move onClick here
  >
    <GlassCard 
      className={`p-4 h-full cursor-pointer hover:shadow-lg transition-all duration-300 ${categoryBgColors[category.name.toLowerCase() as keyof typeof categoryBgColors]}`}
    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-3xl">
                          {category.icon}
                        </div>
                        <h3 className="text-lg font-bold">{category.name}</h3>
                      </div>
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {category.description}
                      </p>
                      <div className="mt-3 text-xs text-gray-400">
                        Click for detailed info →
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Category Detail Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4  z-[1000]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-gray-800 p-6 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{selectedCategory.icon}</div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedCategory.name}</h2>
                  <p className="text-gray-300">{selectedCategory.description}</p>
                </div>
              </div>
              <button 
                onClick={closeModal}
                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Examples */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-green-400">
                    <Package className="w-5 h-5" />
                    Common Items
                  </h3>
                  <p className="text-gray-300">{selectedCategory.examples}</p>
                </div>

                {/* Detailed Tips */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-blue-400">
                    <Info className="w-5 h-5" />
                    Recycling Tips
                  </h3>
                  <ul className="space-y-2">
                    {selectedCategory.detailedTips?.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-300">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

           
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}