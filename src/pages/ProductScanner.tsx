/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Leaf, Loader2, Info, Package, X, Check } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import { ProductCard3D } from '../components/3D/ProductCard3D';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Background } from '../components/Background';

const DEFAULT_IMAGE = 'https://via.placeholder.com/300x300.png?text=No+Image';

// API Services
const foodAPI = {
  getProduct: async (barcode: string) => {
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}?fields=product_name,brands,ecoscore_score,ecoscore_grade,image_url,ingredients_text,nutriscore_grade,packaging`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found in Open Food Facts database');
        }
        throw new Error(`API responded with status ${response.status}`);
      }
      const data = await response.json();
      if (data.status !== 1 || !data.product) {
        throw new Error('Product not found in Open Food Facts');
      }
      return data;
    } catch (error) {
      console.error('Open Food Facts API error:', error);
      throw error;
    }
  }
};

interface ProductData {
  id?: string;
  name: string;
  brand: string;
  ecoScore: number;
  image: string;
  co2Impact: number;
  ingredients: string;
  nutritionGrade: string;
  packaging: string;
  barcode: string;
}

export function ProductScanner() {
  const { user } = useAuth();
  const [scannedProduct, setScannedProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [recentScans, setRecentScans] = useState<ProductData[]>([]);

  // Fetch recent scans from Supabase
  useEffect(() => {
    const fetchRecentScans = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('barcode_scans')
          .select('*')
          .eq('user_id', user.id)
          .order('scan_date', { ascending: false })
          .limit(5);

        if (error) throw error;
        
        if (data) {
          setRecentScans(data.map((scan: any) => ({
            id: scan.id,
            name: scan.product_name,
            brand: scan.brand,
            ecoScore: scan.eco_score || 50,
            image: scan.image_url || DEFAULT_IMAGE,
            co2Impact: scan.co2_impact || 1.5,
            ingredients: scan.ingredients_text || 'No ingredients available',
            nutritionGrade: scan.nutritional_grade || 'unknown',
            packaging: scan.packaging_materials || 'Unknown packaging',
            barcode: scan.barcode || 'Unknown'
          })));
        }
      } catch (error) {
        console.error('Error fetching recent scans:', error);
      }
    };

    fetchRecentScans();
  }, [user]);

  // Save scan to Supabase
  // Save or update scan in Supabase
const saveScanToDatabase = async (product: ProductData) => {
  if (!user) return;
  
  try {
    // First check if this barcode already exists for the user
    const { data: existingScans, error: queryError } = await supabase
      .from('barcode_scans')
      .select('id')
      .eq('user_id', user.id)
      .eq('barcode', product.barcode)
      .limit(1);

    if (queryError) throw queryError;

    if (existingScans && existingScans.length > 0) {
      // Update existing scan
      const { error: updateError } = await supabase
        .from('barcode_scans')
        .update({ 
          scan_date: new Date().toISOString(),
          // You can update other fields here if needed
          eco_score: product.ecoScore,
          co2_impact: product.co2Impact,
          image_url: product.image
        })
        .eq('id', existingScans[0].id);

      if (updateError) throw updateError;
    } else {
      // Insert new scan
      const { error: insertError } = await supabase
        .from('barcode_scans')
        .insert({
          user_id: user.id,
          product_name: product.name,
          brand: product.brand,
          barcode: product.barcode,
          eco_score: product.ecoScore,
          co2_impact: product.co2Impact,
          image_url: product.image,
          ingredients_text: product.ingredients,
          nutritional_grade: product.nutritionGrade,
          packaging_materials: product.packaging,
          scan_date: new Date().toISOString()
        });

      if (insertError) throw insertError;
    }

    // Refresh recent scans
    const { data: recentData } = await supabase
      .from('barcode_scans')
      .select('*')
      .eq('user_id', user.id)
      .order('scan_date', { ascending: false })
      .limit(5);

    if (recentData) {
      setRecentScans(recentData.map((scan: any) => ({
        id: scan.id,
        name: scan.product_name,
        brand: scan.brand,
        ecoScore: scan.eco_score || 50,
        image: scan.image_url || DEFAULT_IMAGE,
        co2Impact: scan.co2_impact || 1.5,
        ingredients: scan.ingredients_text || 'No ingredients available',
        nutritionGrade: scan.nutritional_grade || 'unknown',
        packaging: scan.packaging_materials || 'Unknown packaging',
        barcode: scan.barcode || 'Unknown'
      })));
    }
  } catch (error) {
    console.error('Error saving scan:', error);
  }
};

  // Handle barcode search
  const handleBarcodeSearch = async (barcode: string) => {
  setLoading(true);
  setScannedProduct(null);
  setError('');
  
  try {
    const result = await foodAPI.getProduct(barcode);
    const product = result.product;
    
    // Calculate environmental impact score
    const ecoscore = product.ecoscore_score || 
                    (product.ecoscore_grade === 'a' ? 85 :
                     product.ecoscore_grade === 'b' ? 70 :
                     product.ecoscore_grade === 'c' ? 55 :
                     product.ecoscore_grade === 'd' ? 40 : 25);
    
    // Handle image URL - Open Food Facts returns relative URLs sometimes
    let imageUrl = product.image_url || DEFAULT_IMAGE;
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `https://static.openfoodfacts.org/images/products/${imageUrl}`;
    }

    const newProduct: ProductData = {
      id: crypto.randomUUID(),
      name: product.product_name || 'Unknown Product',
      brand: product.brands || 'Unknown Brand',
      ecoScore: ecoscore,
      image: imageUrl,
      co2Impact: parseFloat((Math.random() * 2 + 0.5).toFixed(1)),
      ingredients: product.ingredients_text || 'No ingredients available',
      nutritionGrade: product.nutriscore_grade || 'unknown',
      packaging: product.packaging || 'Unknown packaging',
      barcode: barcode
    };
    
    setScannedProduct(newProduct);
    await saveScanToDatabase(newProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    setError('Product not found. Try another barcode or check the number.');
  } finally {
    setLoading(false);
  }
};
  // Handle search form submission
  const handleSearch = () => {
    if (searchTerm.trim()) {
      handleBarcodeSearch(searchTerm);
    }
  };

  return (
    <div className="min-h-screen text-white overflow-hidden relative mt-16">
      <Background />
      
      <div className="relative z-10 p-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400 bg-clip-text text-transparent">
            Product Scanner
          </h1>
          <p className="text-gray-300">
            Scan products to discover their environmental impact and sustainability details
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Scanner Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-1 space-y-6"
          >
            <GlassCard className="p-6 hover:shadow-2xl hover:shadow-white/5 transition-all duration-500 hover:scale-[1.02] transform hover:-translate-y-1 group backdrop-blur-md">
  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
    <Search className="w-5 h-5 text-green-400" /> Scan Product
  </h2>
  
  <div className="space-y-4">
    {/* Barcode Search */}
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Enter Barcode
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter barcode..."
          className="flex-1 p-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          disabled={loading}
        />
        <AnimatedButton
          onClick={handleSearch}
          disabled={loading || !searchTerm.trim()}
          className="px-4"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </AnimatedButton>
      </div>
    </div>

    {/* Demo Barcodes */}
    <div className="pt-2">
      <p className="text-xs text-gray-400 mb-2">Try these demo barcodes:</p>
      <div className="flex flex-wrap gap-2">
        {['5449000000996', '3017620422003', '8000500310427', '7613035939849'].map((barcode) => (
          <motion.button
            key={barcode}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSearchTerm(barcode);
              handleBarcodeSearch(barcode);
            }}
            className="text-xs px-3 py-1 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            {barcode}
          </motion.button>
        ))}
      </div>
    </div>
  </div>
</GlassCard>

            {/* Environmental Tips */}
            <GlassCard className="p-6 hover:shadow-2xl hover:shadow-white/5 transition-all duration-500 hover:scale-[1.02] transform hover:-translate-y-1 backdrop-blur-md">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-400" /> Eco Tips
              </h2>
              <div className="space-y-4">
                <div className="p-3 bg-white/5 rounded-lg">
                  <h3 className="font-medium text-green-400">Choose Minimal Packaging</h3>
                  <p className="text-sm text-gray-300 mt-1">Opt for products with less packaging or packaging that's easily recyclable.</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <h3 className="font-medium text-green-400">Buy in Bulk</h3>
                  <p className="text-sm text-gray-300 mt-1">Purchasing larger quantities reduces packaging waste per unit.</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <h3 className="font-medium text-green-400">Look for Recycled Content</h3>
                  <p className="text-sm text-gray-300 mt-1">Products made from recycled materials have a lower environmental impact.</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Right Column - Scanner/Results */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/20 border border-red-500/40 rounded-xl"
              >
                <div className="flex items-center gap-2">
                  <X className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="font-medium">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center h-96"
              >
                <GlassCard className="p-8 text-center hover:shadow-2xl hover:shadow-white/5 transition-all duration-500 hover:scale-[1.02] transform hover:-translate-y-1 backdrop-blur-md">
                  <div className="animate-spin text-4xl mb-4">
                    <Loader2 className="w-12 h-12 mx-auto text-green-400" />
                  </div>
                  <p className="text-lg text-gray-300">Analyzing product...</p>
                </GlassCard>
              </motion.div>
            ) : scannedProduct ? (
          
  <motion.div
    key="product-result"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="space-y-6"
  >
    {/* 3D Product Card with image */}
    <ProductCard3D product={scannedProduct} />

    {/* Product Details */}
   <GlassCard className="p-6 hover:shadow-2xl hover:shadow-white/5 transition-all duration-500 hover:scale-[1.01] backdrop-blur-md">
  <div className="flex flex-col md:flex-row gap-6">
    {/* Product Image */}
    <div className="w-full md:w-1/3">
      <div className="bg-white/5 rounded-lg overflow-hidden">
        <img 
          src={scannedProduct.image} 
          alt={scannedProduct.name}
          className="w-full h-auto object-contain max-h-64 mx-auto"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
          }}
        />
      </div>
    </div>
    
    {/* Product Info */}
    <div className="w-full md:w-2/3">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Info className="w-5 h-5 text-green-400" /> Product Details
      </h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <Package className="w-4 h-4 text-green-400" /> Basic Information
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Name:</span>
                <span className="font-bold">{scannedProduct.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Brand:</span>
                <span className="font-bold">{scannedProduct.brand}</span>
              </div>
              {scannedProduct.barcode && (
                <div className="flex justify-between">
                  <span className="text-gray-300">Barcode:</span>
                  <span className="font-mono font-bold">{scannedProduct.barcode}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-300">Nutrition Grade:</span>
                <span className="font-bold uppercase">{scannedProduct.nutritionGrade}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-green-400" /> Environmental Impact
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">CO₂ Footprint:</span>
                <span className="font-bold text-red-400">{scannedProduct.co2Impact.toFixed(1)} kg CO₂e</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Eco Score:</span>
                <span className={`font-bold ${
                  scannedProduct.ecoScore >= 80 ? 'text-green-400' :
                  scannedProduct.ecoScore >= 60 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {scannedProduct.ecoScore}/100
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Recyclability:</span>
                <span className="font-bold text-green-400">
                  {scannedProduct.packaging.includes('Recycl') ? 'Recyclable' : 'Not Recyclable'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Water Usage:</span>
                <span className="font-bold text-blue-400">
                  {scannedProduct.ingredients.toLowerCase().includes('water') ? 'High' : 'Medium'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Packaging:</span>
                <span className="font-bold text-right max-w-[60%]">
                  {scannedProduct.packaging.split(',').slice(0, 3).join(', ')}
                  {scannedProduct.packaging.split(',').length > 3 ? '...' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-bold mb-2">Ingredients</h4>
            <div className="bg-white/10 p-4 rounded-lg h-48 overflow-y-auto">
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                {scannedProduct.ingredients || 'No ingredients information available'}
              </p>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-2">Sustainability Tips</h4>
            <div className="bg-white/5 p-3 rounded-lg">
              <ul className="text-xs text-gray-300 space-y-1 list-disc list-inside">
                {scannedProduct.packaging.includes('Recycl') && (
                  <li>This packaging is recyclable - please recycle properly</li>
                )}
                {scannedProduct.co2Impact > 1.5 && (
                  <li>Consider alternatives with lower carbon footprint</li>
                )}
                {scannedProduct.nutritionGrade === 'e' && (
                  <li>This product has low nutritional quality</li>
                )}
                <li>Buy in bulk to reduce packaging waste</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</GlassCard>
  </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <GlassCard className="p-8 text-center hover:shadow-2xl hover:shadow-white/5 transition-all duration-500 hover:scale-[1.02] transform hover:-translate-y-1 backdrop-blur-md">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold mb-2">Ready to Scan</h3>
                  <p className="text-gray-300">
                    Enter a barcode to analyze products and view their environmental impact
                  </p>
                </GlassCard>

                {/* Recent Scans */}
               
              </motion.div>
            )}
             {recentScans.length > 0 && (
                  <GlassCard className="p-6 hover:shadow-2xl hover:shadow-white/5 transition-all duration-500 hover:scale-[1.01] backdrop-blur-md">
                    <h3 className="text-xl font-bold mb-4">Your Recent Scans</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {recentScans.map((product) => (
                        <motion.div
                          key={product.id}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setScannedProduct(product)}
                          className="cursor-pointer"
                        >
                          <div className="bg-white/5 rounded-lg p-3 flex flex-col items-center">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-16 h-16 object-contain mb-2 rounded"
                            />
                            <p className="text-sm font-medium text-center truncate w-full">{product.name}</p>
                            <div className={`text-xs mt-1 px-2 py-1 rounded-full ${
                              product.ecoScore >= 80 ? 'bg-green-500/20 text-green-400' :
                              product.ecoScore >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              Eco: {product.ecoScore}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </GlassCard>
                )}
          </div>
        </div>
      </div>
    </div>
  );
}