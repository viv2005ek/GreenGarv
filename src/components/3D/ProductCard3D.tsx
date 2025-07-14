import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '../ui/GlassCard'

interface ProductCard3DProps {
  product: {
    name: string
    brand: string
    ecoScore: number
    image: string
    co2Impact: number
  }
}

export function ProductCard3D({ product }: ProductCard3DProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="perspective-1000">
      <motion.div
        className="relative w-full h-80 transform-style-preserve-3d cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front of card */}
        <GlassCard className="absolute inset-0 p-6 backface-hidden">
          <div className="h-full flex flex-col">
            <div className="flex-1 flex items-center justify-center">
              <div className="w-32 h-32  rounded-full flex items-center justify-center">
             <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-contain p-4"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300.png?text=No+Image';
                  }}
                />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-300 mb-2">{product.name}</h3>
              <p className="text-gray-400 mb-4">{product.brand}</p>
              <div className={`text-2xl font-bold ${getScoreColor(product.ecoScore)}`}>
                {product.ecoScore}/100
              </div>
              <p className="text-sm text-gray-400 mt-1">Eco Score</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Click to flip back</p>
            </div>
          </div>
        </GlassCard>

        {/* Back of card */}
        <GlassCard className="absolute inset-0 p-6 backface-hidden rotate-y-180">
          <div className="h-full flex flex-col justify-center">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-300 mb-4">Environmental Impact</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">CO₂ Footprint</span>
                  <span className="font-bold text-red-600">{product.co2Impact}kg</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Recyclability</span>
                  <span className="font-bold text-green-600">85%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Water Usage</span>
                  <span className="font-bold text-blue-600">Low</span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-500">Click to flip back</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}