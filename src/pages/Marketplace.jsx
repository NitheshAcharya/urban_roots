import { useState, useEffect } from 'react';
import { ShoppingCart, Star, StarHalf, Search, ShieldCheck, Truck, ChevronRight, X, ArrowLeftRight, MapPin, Tag, Plus, CheckCircle, PhoneCall, Gift } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';
import { awardXP, unlockBadge } from '../utils/gamification';
import './Marketplace.css';

const productsData = [
  { id: 1, name: 'Premium Butterhead Lettuce Seeds', desc: 'Non-GMO seeds, high germination rate (95%+), ideal for vertical NFT towers.', emoji: '🥬', cat: 'Seeds', price: 69, oldPrice: 99, badge: 'Best Seller', rating: 4.8, reviews: 142, image: 'https://images.unsplash.com/photo-1550147760-44c9966d6bc7?auto=format&fit=crop&w=600&q=80' },
  { id: 2, name: 'Hydroponic Strawberry Runners', desc: 'Pre-rooted Albion strawberry crowns, ready to insert into vertical pockets.', emoji: '🍓', cat: 'Seeds', price: 189, oldPrice: 249, badge: 'Deal of the Day', rating: 4.6, reviews: 88, image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=600&q=80' },
  { id: 3, name: 'Active Grow Hydroponic Nutrients 1L', desc: 'Specialized liquid mineral fertilizer (A+B) for vegetative and fruiting loops.', emoji: '🧪', cat: 'Fertilizers', price: 349, oldPrice: 499, badge: 'Best Seller', rating: 4.9, reviews: 215, image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=600&q=80' },
  { id: 4, name: 'Expanded Clay Pebbles 10L', desc: 'Porous clay balls providing optimal root aeration for DWC and flood tables.', emoji: '🪨', cat: 'Soil & Mix', price: 299, oldPrice: 399, badge: '', rating: 4.7, reviews: 67, image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=600&q=80' },
  { id: 5, name: 'Coco Coir Grow Block 5kg', desc: 'Low EC coconut husk fibers, expands up to 75L. Great water retention.', emoji: '🥥', cat: 'Soil & Mix', price: 219, oldPrice: 279, badge: 'Organic', rating: 4.5, reviews: 120, image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=600&q=80' },
  { id: 6, name: 'Self-Watering Balcony Planter', desc: 'Equipped with wicking indicator ropes and subsurface water level gauges.', emoji: '🪴', cat: 'Pots', price: 449, oldPrice: 599, badge: '', rating: 4.4, reviews: 54, image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80' },
  { id: 7, name: 'Vertical Grow Tower (30 Pockets)', desc: 'Modular aeroponic stackable column tower with wicking reservoir pump.', emoji: '🗼', cat: 'Pots', price: 3499, oldPrice: 4999, badge: 'Top Brand', rating: 4.8, reviews: 31, image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80' },
  { id: 8, name: 'Neem Oil Pest Control Spray 500ml', desc: 'Cold-pressed natural insect repellent. Non-toxic for home organic plants.', emoji: '🌿', cat: 'Fertilizers', price: 129, oldPrice: 179, badge: 'Organic', rating: 4.6, reviews: 93, image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80' },
  { id: 9, name: 'Smart Moisture pH EC Soil Meter', desc: '3-in-1 digital sensor probe for instant substrate parameters verification.', emoji: '🛠️', cat: 'Tools', price: 599, oldPrice: 890, badge: 'Limited Stock', rating: 4.3, reviews: 76, image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80' },
  { id: 10, name: 'Balcony Hanging Railing Planters (Set of 3)', desc: 'Durable weather-proof plastic hangers suitable for balcony metal rails. Drain holes included.', emoji: '🪴', cat: 'Pots', price: 349, oldPrice: 499, badge: 'Best Seller', rating: 4.7, reviews: 45, image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80' },
  { id: 11, name: 'Organic Neem Cake Fertilizer 2kg', desc: 'Rich in nitrogen and organic pest-repellent compounds. Excellent soil additive.', emoji: '🟫', cat: 'Fertilizers', price: 149, oldPrice: 199, badge: 'Organic', rating: 4.6, reviews: 52, image: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&w=600&q=80' },
  { id: 12, name: 'Automatic Balcony Drip Irrigation Kit', desc: 'Includes battery-operated timer, 10 drippers, and tubes for hassle-free watering while traveling.', emoji: '💧', cat: 'Tools', price: 899, oldPrice: 1299, badge: 'Top Brand', rating: 4.5, reviews: 29, image: 'https://images.unsplash.com/photo-1563514220-ea495c2413be?auto=format&fit=crop&w=600&q=80' },
  { id: 13, name: 'Glow-in-the-Dark Balcony Pebble Stones', desc: 'Decorative luminescent gravel stones for pot dressing and beautiful night ambient lighting.', emoji: '✨', cat: 'Soil & Mix', price: 179, oldPrice: 249, badge: '', rating: 4.4, reviews: 33, image: 'https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?auto=format&fit=crop&w=600&q=80' }
];

const mockBarterListings = [
  {
    id: 'mock-b1',
    user_id: 'mock-u1',
    author_name: 'Priya Sharma',
    author_avatar: '👩🏽‍🌾',
    author_city: 'Bengaluru',
    item_offered: '50 Organic Tomato seeds',
    item_wanted: 'Mint cuttings',
    description: 'Fresh organic Roma Tomato seeds, harvested from my terrace wicking containers last week. Sprouting test was 95%+ success.',
    contact_info: 'priya.s@gardeners.in / 9845011223',
    status: 'active',
    created_at: new Date(Date.now() - 4 * 3600000).toISOString()
  },
  {
    id: 'mock-b2',
    user_id: 'mock-u2',
    author_name: 'Karthik Reddy',
    author_avatar: '👨🏽‍🔬',
    author_city: 'Mysuru',
    item_offered: '2 Curry Leaf plant saplings',
    item_wanted: 'Free / Gifting',
    description: 'Rooted and potted curry leaf saplings. I did a pruning prune last month and successfully rooted these. Take for free!',
    contact_info: 'karthik.reddy@mysoregrow.org',
    status: 'active',
    created_at: new Date(Date.now() - 20 * 3600000).toISOString()
  },
  {
    id: 'mock-b3',
    user_id: 'mock-u3',
    author_name: 'Anjali Rao',
    author_avatar: '👩🏽',
    author_city: 'Mangaluru',
    item_offered: '10 Organic Cocopeat Grow Coins',
    item_wanted: 'Coriander/Cilantro seeds',
    description: 'Excess grow coins from my tower setup. Expands instantly when watered. Looking to swap for local organic Coriander seeds.',
    contact_info: 'anjali.mng@gmail.com / 9123456789',
    status: 'active',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'mock-b4',
    user_id: 'mock-u4',
    author_name: 'Vikram J',
    author_avatar: '🧑🏽',
    author_city: 'Bengaluru',
    item_offered: '1kg organic fresh red chillies',
    item_wanted: 'Free / Gifting',
    description: 'Harvested way too many birds-eye and local green chillies this weekend from my vertical hydroponic pockets. Free pickup.',
    contact_info: 'vikram.j@gmail.com',
    status: 'completed',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'mock-b5',
    user_id: 'mock-u5',
    author_name: 'Chethan Gowda',
    author_avatar: '🧑🏽',
    author_city: 'Udupi',
    item_offered: '10 Sprouted Organic Garlic Cloves',
    item_wanted: 'Lemongrass slips',
    description: 'Sourced from organic heirloom local variety. Sprouted and ready to bury in soil containers. Looking for a few slips of aromatic lemongrass.',
    contact_info: 'chethan.g@udupigardens.net',
    status: 'active',
    created_at: new Date(Date.now() - 6 * 3600000).toISOString()
  },
  {
    id: 'mock-b6',
    user_id: 'mock-u6',
    author_name: 'Deepa Swamy',
    author_avatar: '👩🏽',
    author_city: 'Dharwad',
    item_offered: '15 Net Cups (2-inch)',
    item_wanted: 'Spinach/Palak Seeds',
    description: 'Leftover unused high-grade UV resistant net cups from my NFT build. Perfect for leafy greens. Wanting some organic Palak seeds.',
    contact_info: 'deepa.swamy@gmail.com / 9886012345',
    status: 'active',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

const categories = ['All', 'Seeds', 'Soil & Mix', 'Fertilizers', 'Pots', 'Tools'];
const karnatakaZones = ['All Zones', 'Bengaluru', 'Mangaluru', 'Mysuru', 'Hubballi', 'Belagavi', 'Kalaburagi', 'Davanagere'];

const Marketplace = () => {
  const { user, profile, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('shop'); // 'shop' or 'barter'
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [priceRange, setPriceRange] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addToCart } = useCart();

  // Barter State
  const [barterListings, setBarterListings] = useState([]);
  const [selectedZone, setSelectedZone] = useState('All Zones');
  const [barterSearchQuery, setBarterSearchQuery] = useState('');
  const [isBarterModalOpen, setIsBarterModalOpen] = useState(false);
  const [newBarter, setNewBarter] = useState({
    itemOffered: '',
    itemWanted: '',
    description: '',
    contactInfo: '',
    zone: 'Bengaluru'
  });
  const [isSubmittingBarter, setIsSubmittingBarter] = useState(false);

  useEffect(() => {
    if (profile?.city) {
      // Set default zone for barter modal based on user profile
      const matchedZone = karnatakaZones.find(z => z.toLowerCase() === profile.city.toLowerCase());
      if (matchedZone) {
        setNewBarter(prev => ({ ...prev, zone: matchedZone }));
        setSelectedZone(matchedZone);
      }
    }
  }, [profile]);

  const fetchBarterListings = async () => {
    try {
      const { data, error } = await supabase
        .from('barter_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Combine Supabase data with mock data (filtering duplicates)
      const dbIds = new Set((data || []).map(item => item.id));
      const combined = [...(data || []), ...mockBarterListings.filter(m => !dbIds.has(m.id))];
      setBarterListings(combined);
    } catch (err) {
      console.warn('Could not fetch barter listings from Supabase. Falling back to local storage + mocks:', err.message);
      
      const localListings = localStorage.getItem('barter_listings_local');
      const parsedLocal = localListings ? JSON.parse(localListings) : [];
      
      // Filter out duplicate mock data
      const localIds = new Set(parsedLocal.map(item => item.id));
      const combined = [...parsedLocal, ...mockBarterListings.filter(m => !localIds.has(m.id))];
      setBarterListings(combined);
    }
  };

  useEffect(() => {
    fetchBarterListings();
  }, []);

  const handleCreateBarter = async (e) => {
    e.preventDefault();
    if (!newBarter.itemOffered.trim() || !newBarter.itemWanted.trim() || !newBarter.contactInfo.trim()) return;

    setIsSubmittingBarter(true);
    const listingId = `local-b-${Date.now()}`;
    const listingObject = {
      id: listingId,
      user_id: user?.id || 'guest',
      author_name: profile?.full_name || 'Gardener',
      author_avatar: profile?.avatar_url || '🌱',
      author_city: newBarter.zone,
      item_offered: newBarter.itemOffered,
      item_wanted: newBarter.itemWanted,
      description: newBarter.description,
      contact_info: newBarter.contactInfo,
      status: 'active',
      created_at: new Date().toISOString()
    };

    try {
      if (isAuthenticated) {
        const { data, error } = await supabase
          .from('barter_listings')
          .insert([listingObject])
          .select();
        
        if (error) throw error;
      } else {
        // Fallback for guest users or local storage
        const localListings = localStorage.getItem('barter_listings_local');
        const parsed = localListings ? JSON.parse(localListings) : [];
        localStorage.setItem('barter_listings_local', JSON.stringify([listingObject, ...parsed]));
      }

      // Award XP for listing item
      await awardXP(30, 'Listed an item in Barter Hub', user?.id);
      await unlockBadge('wicking_wizard', user?.id);

      // Close modal and reset form
      setIsBarterModalOpen(false);
      setNewBarter(prev => ({
        ...prev,
        itemOffered: '',
        itemWanted: '',
        description: '',
        contactInfo: ''
      }));
      fetchBarterListings();
    } catch (err) {
      console.error('Error inserting barter listing, falling back to local storage:', err.message);
      
      const localListings = localStorage.getItem('barter_listings_local');
      const parsed = localListings ? JSON.parse(localListings) : [];
      localStorage.setItem('barter_listings_local', JSON.stringify([listingObject, ...parsed]));
      
      // Award XP locally
      await awardXP(30, 'Listed an item in Barter Hub (local)', user?.id);
      await unlockBadge('wicking_wizard', user?.id);
      
      setIsBarterModalOpen(false);
      setNewBarter(prev => ({
        ...prev,
        itemOffered: '',
        itemWanted: '',
        description: '',
        contactInfo: ''
      }));
      fetchBarterListings();
    } finally {
      setIsSubmittingBarter(false);
    }
  };

  const handleToggleListingStatus = async (listingId) => {
    try {
      // Find listing in state
      const target = barterListings.find(b => b.id === listingId);
      if (!target) return;
      const nextStatus = target.status === 'active' ? 'completed' : 'active';

      if (isAuthenticated && !listingId.startsWith('local-b-') && !listingId.startsWith('mock-')) {
        const { error } = await supabase
          .from('barter_listings')
          .update({ status: nextStatus })
          .eq('id', listingId);
        
        if (error) throw error;
      } else {
        // Handle local storage toggle
        const localListings = localStorage.getItem('barter_listings_local');
        if (localListings) {
          const parsed = JSON.parse(localListings);
          const updated = parsed.map(b => b.id === listingId ? { ...b, status: nextStatus } : b);
          localStorage.setItem('barter_listings_local', JSON.stringify(updated));
        }
      }
      
      fetchBarterListings();
    } catch (err) {
      console.warn('Error updating status, doing local update:', err.message);
      const localListings = localStorage.getItem('barter_listings_local');
      if (localListings) {
        const parsed = JSON.parse(localListings);
        const updated = parsed.map(b => b.id === listingId ? { ...b, status: b.status === 'active' ? 'completed' : 'active' } : b);
        localStorage.setItem('barter_listings_local', JSON.stringify(updated));
      }
      fetchBarterListings();
    }
  };


  const filteredProducts = productsData.filter(prod => {
    const matchesCat = activeCategory === 'All' || prod.cat === activeCategory;
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || prod.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = prod.rating >= ratingFilter;
    
    let matchesPrice = true;
    if (priceRange === 'under-200') matchesPrice = prod.price < 200;
    else if (priceRange === '200-500') matchesPrice = prod.price >= 200 && prod.price <= 500;
    else if (priceRange === 'over-500') matchesPrice = prod.price > 500;

    return matchesCat && matchesSearch && matchesRating && matchesPrice;
  });

  const filteredBarterListings = barterListings.filter(item => {
    const matchesZone = selectedZone === 'All Zones' || item.author_city.toLowerCase() === selectedZone.toLowerCase();
    const matchesSearch = item.item_offered.toLowerCase().includes(barterSearchQuery.toLowerCase()) || 
                          item.item_wanted.toLowerCase().includes(barterSearchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(barterSearchQuery.toLowerCase());
    return matchesZone && matchesSearch;
  });

  const renderStars = (rating) => {
    const stars = [];
    const floor = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= floor) {
        stars.push(<Star key={i} size={14} fill="#ffa41c" color="#ffa41c" />);
      } else if (i - 0.5 === rating) {
        stars.push(<StarHalf key={i} size={14} fill="#ffa41c" color="#ffa41c" />);
      } else {
        stars.push(<Star key={i} size={14} color="#bdc3c7" />);
      }
    }
    return stars;
  };

  return (
    <div className="marketplace-amazon page-transition">
      {/* Marketplace Tab Switching Header */}
      <div className="market-tabs-row glass-card">
        <button 
          className={`market-tab-btn ${activeTab === 'shop' ? 'active' : ''}`}
          onClick={() => setActiveTab('shop')}
        >
          🛒 Shop Products
        </button>
        <button 
          className={`market-tab-btn ${activeTab === 'barter' ? 'active' : ''}`}
          onClick={() => setActiveTab('barter')}
        >
          ♻️ P2P Barter & Swap Hub
        </button>
      </div>

      {activeTab === 'shop' ? (
        <>
          {/* Amazon top search bar row */}
          <section className="market-search-bar-row glass-card">
            <div className="search-bar-inner">
              <Search size={18} className="search-icon-market" />
              <input 
                type="text" 
                placeholder="Search UrbanRoots Market... (e.g. Clay Pebbles, Tomato Seeds)" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </section>

          <div className="market-layout-split">
            {/* Left Side Filters - Amazon Style */}
            <aside className="market-sidebar glass-card">
              <h4>Category</h4>
              <div className="sidebar-links-list">
                {categories.map(cat => (
                  <button 
                    key={cat} 
                    className={`sidebar-link-btn ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat} <ChevronRight size={12} />
                  </button>
                ))}
              </div>

              <h4>Customer Reviews</h4>
              <div className="sidebar-reviews-list">
                {[4, 3, 2].map(stars => (
                  <button 
                    key={stars} 
                    className={`sidebar-rating-btn ${ratingFilter === stars ? 'active' : ''}`}
                    onClick={() => setRatingFilter(ratingFilter === stars ? 0 : stars)}
                  >
                    <div className="stars-row">{renderStars(stars)}</div>
                    <span>& Up</span>
                  </button>
                ))}
              </div>

              <h4>Price Range</h4>
              <div className="sidebar-price-list">
                {[
                  { id: 'all', label: 'All Prices' },
                  { id: 'under-200', label: 'Under ₹200' },
                  { id: '200-500', label: '₹200 - ₹500' },
                  { id: 'over-500', label: 'Over ₹500' }
                ].map(range => (
                  <button 
                    key={range.id} 
                    className={`sidebar-price-btn ${priceRange === range.id ? 'active' : ''}`}
                    onClick={() => setPriceRange(range.id)}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </aside>

            {/* Right Side Grid - Amazon Style */}
            <main className="market-grid-container">
              <div className="market-results-header">
                <span>Showing {filteredProducts.length} results</span>
                {searchQuery && <span> for "{searchQuery}"</span>}
              </div>

              <div className="market-grid-amazon">
                {filteredProducts.map(product => {
                  const discountPercent = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
                  return (
                    <div key={product.id} className="glass-card product-card-amazon" onClick={() => setSelectedProduct(product)}>
                      <div className="product-image-box-amazon">
                        {product.badge && (
                          <span className={`badge-tag ${product.badge.toLowerCase().replace(/\s+/g, '-')}`}>
                            {product.badge}
                          </span>
                        )}
                        <span className="product-emoji-large">{product.emoji}</span>
                      </div>

                      <div className="product-details-amazon">
                        <h3 className="product-title-amazon">{product.name}</h3>
                        
                        <div className="product-rating-row-amazon">
                          <div className="stars-wrapper">{renderStars(product.rating)}</div>
                          <span className="reviews-count-amazon">{product.reviews}</span>
                        </div>

                        <div className="product-price-block-amazon">
                          <div className="price-primary-row">
                            <span className="discount-pct-amazon">-{discountPercent}%</span>
                            <span className="price-symbol-amazon">₹</span>
                            <span className="price-value-amazon">{product.price}</span>
                          </div>
                          <div className="price-list-row">
                            <span>List Price: </span>
                            <span className="old-price-amazon">₹{product.oldPrice}</span>
                          </div>
                          <span className="savings-label-amazon">Save ₹{product.oldPrice - product.price}</span>
                        </div>

                        <div className="product-shipping-amazon">
                          <Truck size={14} className="shipping-icon" />
                          <span>FREE Delivery tomorrow</span>
                        </div>

                        <button 
                          className="amazon-add-btn" 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            addToCart(product); 
                          }}
                        >
                          <ShoppingCart size={14} /> Add to Cart
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <div className="glass-card no-products-card">
                    <span className="no-products-emoji">🛒</span>
                    <h3>No items match your filters</h3>
                    <p>Try resetting the search or category toggles.</p>
                  </div>
                )}
              </div>
            </main>
          </div>

          {/* Product Detail Modal */}
          {selectedProduct && (
            <div className="product-modal-overlay-amazon" onClick={() => setSelectedProduct(null)}>
              <div className="glass-card product-modal-amazon page-transition" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn-amazon" onClick={() => setSelectedProduct(null)}>
                  <X size={20} />
                </button>
                
                <div className="modal-split-amazon">
                  <div className="modal-left-visual">
                    <div className="modal-emoji-box">{selectedProduct.emoji}</div>
                    <div className="badges-row">
                      <span className="badge-tag green">Secure Checkout</span>
                      <span className="badge-tag blue">Organic Choice</span>
                    </div>
                  </div>

                  <div className="modal-right-content">
                    <div className="category-meta">{selectedProduct.cat}</div>
                    <h2>{selectedProduct.name}</h2>
                    
                    <div className="modal-rating-block">
                      <div className="stars-row">{renderStars(selectedProduct.rating)}</div>
                      <span>{selectedProduct.rating} out of 5 stars · {selectedProduct.reviews} customer ratings</span>
                    </div>

                    <div className="modal-divider"></div>

                    <div className="modal-price-hud">
                      <div className="deal-label">Deal of the Day</div>
                      <div className="price-row">
                        <span className="price-off-pct">-{Math.round(((selectedProduct.oldPrice - selectedProduct.price) / selectedProduct.oldPrice) * 100)}%</span>
                        <span className="price-val">₹{selectedProduct.price}</span>
                      </div>
                      <div className="list-price-row">List Price: <span>₹{selectedProduct.oldPrice}</span></div>
                      <div className="save-row">You save: <strong style={{color: 'var(--color-accent-red)'}}>₹{selectedProduct.oldPrice - selectedProduct.price} (Inclusive of all taxes)</strong></div>
                    </div>

                    <div className="modal-divider"></div>

                    <div className="modal-description-block">
                      <h3>About this item</h3>
                      <p>{selectedProduct.desc}</p>
                    </div>

                    <div className="modal-shipping-hud">
                      <div className="shipping-item"><Truck size={16} /> <span>FREE Delivery tomorrow. Order within 4 hrs.</span></div>
                      <div className="shipping-item"><ShieldCheck size={16} /> <span>10-Day Returnable & Replacement Protected.</span></div>
                    </div>

                    <button 
                      className="modal-buy-now-btn" 
                      onClick={() => { 
                        addToCart(selectedProduct); 
                        setSelectedProduct(null); 
                      }}
                    >
                      <ShoppingCart size={16} /> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* P2P Barter & Swap Hub View */
        <div className="barter-hub-container page-transition">
          <section className="barter-intro-banner glass-card">
            <div>
              <h2>Community Barter & Seed Swap Hub</h2>
              <p>Exchange surplus seeds, vegetable cuttings, or extra organic harvests with gardeners in your zone. Reduce waste, save water, and cultivate sustainable trust.</p>
            </div>
            <button className="btn-primary list-swap-banner-btn" onClick={() => setIsBarterModalOpen(true)}>
              <Plus size={16} /> List Swap Item (+30 XP)
            </button>
          </section>

          {/* Barter Search and Filter controls */}
          <section className="barter-search-row glass-card">
            <div className="barter-search-inner">
              <Search size={18} className="search-icon-market" />
              <input 
                type="text" 
                placeholder="Search seed swaps & cuttings... (e.g. Tomato seeds, Mint)" 
                value={barterSearchQuery}
                onChange={(e) => setBarterSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="barter-filter-group">
              <MapPin size={16} className="filter-icon" />
              <select 
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="barter-zone-select"
              >
                {karnatakaZones.map(zone => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </select>
            </div>
          </section>

          {/* Barter Grid */}
          <div className="barter-listings-grid">
            {filteredBarterListings.map(listing => (
              <div key={listing.id} className={`glass-card barter-card ${listing.status === 'completed' ? 'completed-swap' : ''}`}>
                <div className="barter-header">
                  <div className="author-block">
                    <span className="author-avatar">{listing.author_avatar || '🌱'}</span>
                    <div>
                      <h5>{listing.author_name}</h5>
                      <span>{new Date(listing.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                  <span className="barter-zone"><MapPin size={11} /> {listing.author_city}</span>
                </div>

                <div className="barter-content">
                  <div className="trade-deal-row">
                    <div className="deal-part offered">
                      <small>OFFERS</small>
                      <h4>{listing.item_offered}</h4>
                    </div>
                    <ArrowLeftRight className="swap-icon-arrow" size={16} />
                    <div className="deal-part wanted">
                      <small>WANTS</small>
                      <h4>{listing.item_wanted.toLowerCase().includes('free') ? <span className="free-gifting-badge"><Gift size={12} /> {listing.item_wanted}</span> : listing.item_wanted}</h4>
                    </div>
                  </div>

                  <p className="barter-desc">{listing.description}</p>
                </div>

                <div className="barter-footer">
                  <div className="contact-details-box" title="Contact listing owner">
                    <PhoneCall size={12} />
                    <span>{listing.contact_info}</span>
                  </div>
                  
                  {listing.status === 'completed' ? (
                    <span className="status-badge-completed">Completed Swap</span>
                  ) : (
                    (user?.id === listing.user_id || listing.user_id === 'guest') && (
                      <button 
                        className="toggle-status-btn complete"
                        onClick={() => handleToggleListingStatus(listing.id)}
                      >
                        Mark Swapped
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}

            {filteredBarterListings.length === 0 && (
              <div className="glass-card no-listings-card">
                <span className="no-listings-emoji">♻️</span>
                <h3>No barter exchanges match your filter</h3>
                <p>Try resetting the zone filter or be the first to list excess seeds/cuttings in {selectedZone}!</p>
              </div>
            )}
          </div>

          {/* Barter Modal */}
          {isBarterModalOpen && (
            <div className="barter-modal-overlay" onClick={() => setIsBarterModalOpen(false)}>
              <form 
                className="glass-card barter-modal-form page-transition" 
                onClick={e => e.stopPropagation()}
                onSubmit={handleCreateBarter}
              >
                <div className="modal-header-barter">
                  <h3>List Seed Swap or Excess Harvest</h3>
                  <button type="button" className="close-barter-modal" onClick={() => setIsBarterModalOpen(false)}>
                    <X size={18} />
                  </button>
                </div>

                <div className="modal-body-barter">
                  <div className="form-row-barter">
                    <div className="form-group-barter">
                      <label>What item do you have in excess?</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 50 organic Tomato seeds, Mint cuttings"
                        required
                        value={newBarter.itemOffered}
                        onChange={e => setNewBarter({...newBarter, itemOffered: e.target.value})}
                      />
                    </div>
                    <div className="form-group-barter">
                      <label>What are you looking for in exchange?</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Lemon grass roots, or 'Free / Gifting'"
                        required
                        value={newBarter.itemWanted}
                        onChange={e => setNewBarter({...newBarter, itemWanted: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="form-row-barter">
                    <div className="form-group-barter">
                      <label>Karnataka Zone</label>
                      <select 
                        value={newBarter.zone}
                        onChange={e => setNewBarter({...newBarter, zone: e.target.value})}
                      >
                        {karnatakaZones.filter(z => z !== 'All Zones').map(zone => (
                          <option key={zone} value={zone}>{zone}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group-barter">
                      <label>Contact Details (Email or Phone)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. karthik@email.com / 9845012345"
                        required
                        value={newBarter.contactInfo}
                        onChange={e => setNewBarter({...newBarter, contactInfo: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="form-group-barter full-width">
                    <label>Description (Details about condition, harvest date, meeting location)</label>
                    <textarea 
                      placeholder="e.g. Harvested from my balcony hydroponic tower yesterday. I am willing to meet at Indiranagar Metro Station for the exchange..."
                      rows="3"
                      required
                      value={newBarter.description}
                      onChange={e => setNewBarter({...newBarter, description: e.target.value})}
                    />
                  </div>
                </div>

                <div className="modal-footer-barter">
                  <button type="button" className="cancel-barter-btn" onClick={() => setIsBarterModalOpen(false)}>Cancel</button>
                  <button type="submit" className="submit-barter-btn" disabled={isSubmittingBarter}>
                    {isSubmittingBarter ? 'Publishing...' : 'List in Swap Hub (+30 XP)'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
