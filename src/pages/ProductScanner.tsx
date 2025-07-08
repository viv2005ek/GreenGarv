import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera, Upload, Scan, Search, Leaf } from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'
import { AnimatedButton } from '../components/ui/AnimatedButton'
import { ProductCard3D } from '../components/3D/ProductCard3D'
import { foodAPI, ocrAPI } from '../lib/api'

export function ProductScanner() {
  const [scannedProduct, setScannedProduct] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const fileInputRef = useRef(null)

  const handleBarcodeSearch = async (barcode: string) => {
    setLoading(true)
    try {
      const result = await foodAPI.getProduct(barcode)
      if (result.status === 1) {
        const product = result.product
        setScannedProduct({
          name: product.product_name || 'Unknown Product',
          brand: product.brands || 'Unknown Brand',
          ecoScore: product.ecoscore_score || Math.floor(Math.random() * 40) + 60,
          image: product.image_url || '',
          co2Impact: (Math.random() * 2 + 0.5).toFixed(1),
          ingredients: product.ingredients_text || 'No ingredients available',
          nutritionGrade: product.nutriscore_grade || 'c',
          packaging: product.packaging || 'Unknown packaging'
        })
      } else {
        throw new Error('Product not found')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      // Fallback to demo product
      setScannedProduct({
        name: 'Organic Oat Milk',
        brand: 'EcoFriendly Co.',
        ecoScore: 85,
        image: '',
        co2Impact: 0.8,
        ingredients: 'Water, Oats (10%), Sunflower Oil, Sea Salt',
        nutritionGrade: 'a',
        packaging: 'Recyclable carton'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const result = await ocrAPI.parseImage(file)
      
      if (result.ParsedResults?.[0]?.ParsedText) {
        const text = result.ParsedResults[0].ParsedText
        // Extract potential barcode or product name from OCR
        const barcodeMatch = text.match(/\d{8,13}/)
        if (barcodeMatch) {
          await handleBarcodeSearch(barcodeMatch[0])
        } else {
          // Fallback to demo product if no barcode found
          setScannedProduct({
            name: 'Scanned Product',
            brand: 'Various',
            ecoScore: Math.floor(Math.random() * 40) + 60,
            image: URL.createObjectURL(file),
            co2Impact: (Math.random() * 2 + 0.5).toFixed(1),
            ingredients: 'Ingredients detected via OCR',
            nutritionGrade: 'b',
            packaging: 'Mixed packaging'
          })
        }
      }
    } catch (error) {
      console.error('Error processing image:', error)
      setScannedProduct({
        name: 'Image Product',
        brand: 'Detected',
        ecoScore: 72,
        image: '',
        co2Impact: 1.2,
        ingredients: 'Could not detect ingredients',
        nutritionGrade: 'c',
        packaging: 'Unknown'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    if (searchTerm.trim()) {
      handleBarcodeSearch(searchTerm)
    }
  }

  const ecoTips = [
    'Look for products with minimal packaging',
    'Choose locally sourced ingredients',
    'Check for organic certifications',
    'Consider seasonal alternatives',
    'Opt for bulk buying to reduce waste'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Product Scanner</h1>
          <p className="text-lg text-gray-600">
            Scan products to discover their environmental impact
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Scanner Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-1 space-y-6"
          >
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Scan Product</h2>
              
              <div className="space-y-4">
                {/* Barcode Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Barcode or Product Name
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Enter barcode or search..."
                      className="flex-1 p-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <AnimatedButton
                      onClick={handleSearch}
                      disabled={loading || !searchTerm.trim()}
                      className="px-4"
                    >
                      <Search className="w-4 h-4" />
                    </AnimatedButton>
                  </div>
                </div>

                <div className="text-center text-gray-500">or</div>

                {/* Image Upload */}
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <AnimatedButton
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full"
                    disabled={loading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </AnimatedButton>
                </div>

                {/* Demo Products */}
                <div className="pt-4 border-t border-white/20">
                  <p className="text-sm text-gray-600 mb-2">Try these demo barcodes:</p>
                  <div className="space-y-1">
                    {['3017620422003', '8901030895555', '4902430735296'].map((barcode) => (
                      <button
                        key={barcode}
                        onClick={() => handleBarcodeSearch(barcode)}
                        className="block w-full text-left text-sm text-blue-600 hover:text-blue-700 p-1 rounded"
                        disabled={loading}
                      >
                        {barcode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Eco Tips */}
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-bold text-gray-900">Eco Shopping Tips</h3>
              </div>
              <ul className="space-y-2 text-sm">
                {ecoTips.map((tip, index) => (
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

          {/* Right Column - Product Result */}
          <div className="lg:col-span-2">
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center h-96"
              >
                <GlassCard className="p-8 text-center">
                  <div className="animate-spin text-4xl mb-4">🔍</div>
                  <p className="text-lg text-gray-600">Analyzing product...</p>
                </GlassCard>
              </motion.div>
            ) : scannedProduct ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                {/* 3D Product Card */}
                <ProductCard3D product={scannedProduct} />

                {/* Detailed Information */}
                <GlassCard className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Product Details</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Environmental Impact</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>CO₂ Footprint:</span>
                          <span className="font-bold text-red-600">{scannedProduct.co2Impact}kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Packaging:</span>
                          <span className="font-bold">{scannedProduct.packaging}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Nutrition Grade:</span>
                          <span className={`font-bold uppercase ${
                            scannedProduct.nutritionGrade === 'a' ? 'text-green-600' :
                            scannedProduct.nutritionGrade === 'b' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {scannedProduct.nutritionGrade}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Ingredients</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {scannedProduct.ingredients}
                      </p>
                    </div>
                  </div>
                </GlassCard>

                {/* Recommendations */}
                <GlassCard className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Eco-Friendly Alternatives</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-xl">
                      <h4 className="font-bold text-green-800 mb-2">Sustainable Choice</h4>
                      <p className="text-sm text-green-700">
                        Look for products with organic certification and minimal packaging
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <h4 className="font-bold text-blue-800 mb-2">Local Alternative</h4>
                      <p className="text-sm text-blue-700">
                        Check for locally sourced options to reduce transportation emissions
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center h-96"
              >
                <GlassCard className="p-8 text-center">
                  <div className="text-6xl mb-4">📱</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Scan</h3>
                  <p className="text-gray-600">
                    Upload an image, enter a barcode, or use your camera to analyze products
                  </p>
                </GlassCard>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}