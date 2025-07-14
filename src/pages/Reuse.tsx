import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Plus, X, MapPin, Search } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import { useAuth } from '../hooks/useAuth';
import { Background } from '../components/Background';
import { LoadingScreen } from './LoadingScreen';
import { supabase } from '../lib/supabase'; // Your Supabase client


interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  condition: string;
  contact_number: string;
  location: string;
  tags: string[];
  created_at: string;
  user_id: string;
}

const categories = [
  'Electronics',
  'Furniture',
  'Clothing',
  'Books',
  'Toys',
  'Home Appliances',
  'Other'
];

const conditions = ['New', 'Like New', 'Good', 'Fair', 'Needs Repair'];

export function Reuse() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    maxPrice: '',
    condition: ''
  });
const [tagsInput, setTagsInput] = useState('');

  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    price: 0,
    image_url: '',
    category: '',
    condition: '',
    contact_number: '',
    location: '',
    tags: [] as string[]
  });

  // Fetch listings from Supabase
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('listings')
          .select('*')
          .order('created_at', { ascending: false });

        if (filters.category) {
          query = query.eq('category', filters.category);
        }
        if (filters.condition) {
          query = query.eq('condition', filters.condition);
        }
        if (filters.maxPrice) {
          query = query.lte('price', Number(filters.maxPrice));
        }

        const { data, error } = await query;

        if (error) throw error;
        setListings(data || []);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [filters]);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('listings')
        .insert([{
          ...newListing,
          user_id: user.id,
          price: Number(newListing.price)
        }])
        .select();

      if (error) throw error;

      if (data) {
        setListings([data[0], ...listings]);
        setShowCreateForm(false);
        setNewListing({
          title: '',
          description: '',
          price: 0,
          image_url: '',
          category: '',
          condition: '',
          contact_number: '',
          location: '',
          tags: []
        });
      }
    } catch (error) {
      console.error('Error creating listing:', error);
    }
  };

  const handleContactSeller = (listing: Listing) => {
    const message = `Hi! I'm ${user?.user_metadata?.full_name || 'a buyer'} and want to purchase ${listing.title}.`;
    window.open(`https://wa.me/${listing.contact_number}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading && listings.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen text-white overflow-hidden relative mt-16">
      <Background />
      
      <div className="relative z-10 p-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400 bg-clip-text text-transparent">
              Reuse Marketplace
            </h1>
            <p className="text-gray-300">
              Give items a second life instead of throwing them away
            </p>
          </div>
          
          <AnimatedButton 
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2"
          >
            <div className="flex items-center">
  <Plus className="w-4 h-4 mr-2 text-green-600" />
  Create Listing
</div>

          </AnimatedButton>
        </div>

        {/* Filters */}
        <GlassCard className="p-4 mb-6 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              className="w-full pl-10 pr-4 py-2 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          
          <select
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            className="bg-white/10 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 dark-select"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <select
            value={filters.condition}
            onChange={(e) => setFilters({...filters, condition: e.target.value})}
            className="bg-white/10 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 dark-select"
          >
            <option value="">Any Condition</option>
            {conditions.map(cond => (
              <option key={cond} value={cond}>{cond}</option>
            ))}
          </select>
          
          <input
            type="number"
            placeholder="Max price"
            value={filters.maxPrice}
            onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
            className="bg-white/10 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 w-24"
          />
        </GlassCard>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="p-4 h-full flex flex-col hover:shadow-lg hover:shadow-green-400/20 transition-all">
                <div className="relative pb-[75%] rounded-lg overflow-hidden mb-3">
                  <img
                    src={listing.image_url}
                    alt={listing.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-grow">
                  <h3 className="font-bold text-lg line-clamp-1">{listing.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-300 my-1">
                    <MapPin className="w-4 h-4" />
                    {listing.location}
                  </div>
                  <p className="text-gray-300 text-sm line-clamp-2 mb-3">{listing.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs px-2 py-1 bg-green-400/20 rounded-full">
                      {listing.category}
                    </span>
                    <span className="text-xs px-2 py-1 bg-blue-400/20 rounded-full">
                      {listing.condition}
                    </span>
                    {listing.tags?.map(tag => (
                      <span key={tag} className="text-xs px-2 py-1 bg-white/10 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-green-400 font-bold text-lg">{(listing.price)==0?"Free":`$${listing.price}`}</span>
                  <AnimatedButton
                    onClick={() => handleContactSeller(listing)}
                    className="flex items-center gap-2"
                  >
                    <div className="flex items-center">
  <MessageSquare className="w-4 h-4 mr-2 text-gray-200" />
  Contact
</div>

                  </AnimatedButton>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && listings.length === 0 && (
          <GlassCard className="p-8 text-center">
            <h3 className="text-xl font-bold mb-2">No listings found</h3>
            <p className="text-gray-300 mb-4">Try adjusting your filters or create the first listing!</p>
            <AnimatedButton onClick={() => setShowCreateForm(true)}>
              Create Listing
            </AnimatedButton>
          </GlassCard>
        )}

        {/* Create Listing Modal */}
       {showCreateForm && (
  <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative bg-gray-900 rounded-xl max-w-md w-full max-h-[70vh] overflow-hidden flex flex-col"
    >
      {/* Header with close button */}
      <div className="sticky top-0 bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center z-10">
        <h2 className="text-2xl font-bold">Create New Listing</h2>
        <button
          onClick={() => setShowCreateForm(false)}
          className="p-1 rounded-full hover:bg-gray-700 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      {/* Scrollable form content */}
      <div className="overflow-y-auto p-6">
        <form onSubmit={handleCreateListing} className="space-y-4">
              
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <input
                    type="text"
                    value={newListing.title}
                    onChange={(e) => setNewListing({...newListing, title: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description *</label>
                  <textarea
                    value={newListing.description}
                    onChange={(e) => setNewListing({...newListing, description: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    rows={3}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Image URL *</label>
                  <input
                    type="url"
                    value={newListing.image_url}
                    onChange={(e) => setNewListing({...newListing, image_url: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Price ($) *</label>
                    <input
                      type="number"
                      value={newListing.price}
                      onChange={(e) => setNewListing({...newListing, price: Number(e.target.value)})}
                      className="w-full px-4 py-2 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Category *</label>
                    <select
                      value={newListing.category}
                      onChange={(e) => setNewListing({...newListing, category: e.target.value})}
                      className="w-full px-4 py-2 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 dark-select"
                      required
                    >
                      <option value="">Select</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Condition *</label>
                    <select
                      value={newListing.condition}
                      onChange={(e) => setNewListing({...newListing, condition: e.target.value})}
                      className="w-full px-4 py-2 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 dark-select"
                      required
                    >
                      <option value="">Select</option>
                      {conditions.map(cond => (
                        <option key={cond} value={cond}>{cond}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Location *</label>
                    <input
                      type="text"
                      value={newListing.location}
                      onChange={(e) => setNewListing({...newListing, location: e.target.value})}
                      className="w-full px-4 py-2 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Number (WhatsApp) *</label>
                  <input
                    type="tel"
                    value={newListing.contact_number}
                    onChange={(e) => setNewListing({...newListing, contact_number: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                    required
                  />
                </div>
                
                

<div>
  <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
  <input
    type="text"
    value={tagsInput}
    onChange={(e) => {
      const value = e.target.value;
      setTagsInput(value);
      
      // Update the tags array in newListing
      const tags = value === '' ? [] : value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      setNewListing({
        ...newListing,
        tags: tags
      });
    }}
    className="w-full px-4 py-2 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
    placeholder="vintage, wooden, antique"
  />
</div>
                
                <AnimatedButton type="submit" className="w-full mt-6">
                  Publish Listing
                </AnimatedButton>
              </form>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}