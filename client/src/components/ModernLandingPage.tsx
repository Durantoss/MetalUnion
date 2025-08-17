import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface Band {
  id: string;
  name: string;
  genre: string;
  description: string;
  imageUrl?: string;
  founded?: number;
  members?: string[];
  albums?: string[];
  website?: string;
  instagram?: string;
}

interface ModernLandingPageProps {
  onSectionChange: (section: string) => void;
  bands: Band[];
}

export function ModernLandingPage({ onSectionChange, bands }: ModernLandingPageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Mouse tracking for parallax effects
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((event.clientX - centerX) / 10);
    y.set((event.clientY - centerY) / 10);
    
    setMousePosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  // Stats with enhanced loading
  const [stats, setStats] = useState({
    bands: bands?.length || 0,
    tours: 0,
    reviews: 0,
    photos: 0
  });

  const featuredBands = bands?.slice(0, 4) || [];

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats(prev => ({ ...prev, bands: bands?.length || 0 }));
        
        const responses = await Promise.allSettled([
          fetch('/api/tours').then(r => r.json()).catch(() => []),
          fetch('/api/reviews').then(r => r.json()).catch(() => []),
          fetch('/api/photos').then(r => r.json()).catch(() => [])
        ]);
        
        setStats(prev => ({
          ...prev,
          tours: responses[0].status === 'fulfilled' ? responses[0].value?.length || 0 : 0,
          reviews: responses[1].status === 'fulfilled' ? responses[1].value?.length || 0 : 0,
          photos: responses[2].status === 'fulfilled' ? responses[2].value?.length || 0 : 0
        }));
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats(prev => ({ ...prev, bands: bands?.length || 0 }));
      }
    };
    
    fetchStats();
  }, [bands]);

  // Auto-rotate featured bands
  useEffect(() => {
    if (featuredBands.length > 0) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % featuredBands.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [featuredBands.length]);

  const sections = [
    {
      id: 'bands',
      title: 'SCAN',
      subtitle: 'Entities',
      description: 'Decrypt underground resistance networks',
      icon: '▼',
      stats: `${stats.bands}`,
      gradient: 'from-fire-red via-lava-orange to-electric-yellow',
      glowColor: 'fire-red'
    },
    {
      id: 'tours',
      title: 'TRACK',
      subtitle: 'Operations',
      description: 'Monitor live field activities',
      icon: '◉',
      stats: `${stats.tours}`,
      gradient: 'from-electric-yellow via-amber to-fire-red',
      glowColor: 'electric-yellow'
    },
    {
      id: 'reviews',
      title: 'ANALYZE',
      subtitle: 'Intel',
      description: 'Decode sonic warfare patterns',
      icon: '◈',
      stats: `${stats.reviews}`,
      gradient: 'from-fire-red via-crimson to-lava-orange',
      glowColor: 'fire-red'
    },
    {
      id: 'photos',
      title: 'ARCHIVE',
      subtitle: 'Evidence',
      description: 'Visual surveillance data',
      icon: '◆',
      stats: `${stats.photos}`,
      gradient: 'from-amber via-golden-yellow to-electric-yellow',
      glowColor: 'electric-yellow'
    },
    {
      id: 'pit',
      title: 'LINK',
      subtitle: 'Network',
      description: 'Neural mesh convergence',
      icon: '⬢',
      stats: '∞',
      gradient: 'from-lava-orange via-fire-red to-blood-red',
      glowColor: 'lava-orange'
    }
  ];

  if (!bands || bands.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div 
          className="text-center max-w-md mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1 
            className="text-6xl font-black gradient-text-neon mb-6 glow-text cyberpunk-flicker"
            initial={{ y: -30 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            NEURAL.NET
          </motion.h1>
          <motion.p 
            className="text-muted-foreground mb-8 text-lg font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            INITIALIZING NEURAL PATHWAYS...
          </motion.p>
          <motion.button 
            onClick={() => onSectionChange('bands')}
            className="glass neo-border px-8 py-4 rounded-2xl font-bold text-lg hover-lift hover:glow-primary transition-all duration-300"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            data-testid="button-enter-site"
          >
            JACK IN
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-background text-foreground overflow-x-hidden custom-scrollbar"
      onMouseMove={handleMouseMove}
    >
      {/* Floating Navigation */}
      <motion.button
        onClick={() => onSectionChange('bands')}
        className="fixed top-6 right-6 z-50 glass neo-shadow-sm p-3 rounded-full hover-lift group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        data-testid="button-floating-nav"
      >
        <svg className="w-6 h-6 text-electric-yellow group-hover:text-fire-red transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </motion.button>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Ultra Dynamic Background Grid */}
        <div className="absolute inset-0 opacity-25">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 0, 0, 0.15) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 0, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
              transform: `translateX(${mousePosition.x * 0.02}px) translateY(${mousePosition.y * 0.02}px)`
            }}
          />
          {/* Dynamic scanning lines */}
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, 
                transparent 0%, 
                rgba(255, 255, 0, 0.05) 50%, 
                transparent 100%)`,
              animation: 'scan-lines 2s ease-in-out infinite alternate'
            }}
          />
        </div>

        {/* Floating Energy Orbs */}
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 rounded-full bg-fire-red opacity-30 blur-xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            x: mouseX,
            y: mouseY,
          }}
        />
        
        <motion.div
          className="absolute bottom-32 right-32 w-24 h-24 rounded-full bg-electric-yellow opacity-40 blur-lg"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Main Hero Content */}
        <motion.div 
          className="relative z-10 text-center max-w-6xl mx-auto px-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <h1 className="text-8xl md:text-9xl font-black mb-4 gradient-text-neon font-mono tracking-tighter cyberpunk-flicker">
              CYBERPIT.SYS
            </h1>
            <div className="h-1 w-32 mx-auto animated-gradient rounded-full"></div>
          </motion.div>
          
          <motion.p 
            className="text-2xl md:text-4xl font-bold text-foreground mb-6 font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <span className="text-electric-yellow">&gt;</span> DYSTOPIAN METAL GRID <span className="text-fire-red cyberpunk-flicker">_</span>
          </motion.p>
          
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            The machine empire burns. Metal warriors rise from molten ashes, forged in electric fury. 
            Join the lightning revolution. Track fire shows. Analyze thunderous warfare.
          </motion.p>

          {/* Featured Band Terminal */}
          {featuredBands.length > 0 && (
            <motion.div 
              className="glass neo-border rounded-2xl p-6 mb-12 max-w-lg mx-auto font-mono"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-fire-red"></div>
                <div className="w-3 h-3 rounded-full bg-electric-yellow"></div>
                <div className="w-3 h-3 rounded-full bg-void-black border border-fire-red"></div>
                <span className="text-muted-foreground text-sm ml-2">~/featured-band</span>
              </div>
              <div className="text-left">
                <p className="text-electric-yellow text-sm">$ band --fire-scan</p>
                <p className="text-foreground text-xl font-bold break-words">
                  {featuredBands[currentImageIndex]?.name}
                </p>
                <p className="text-fire-red">
                  Genre: <span className="text-electric-yellow">{featuredBands[currentImageIndex]?.genre}</span>
                </p>
              </div>
            </motion.div>
          )}

          <motion.button
            onClick={() => onSectionChange('bands')}
            className="glass neo-shadow px-12 py-6 rounded-2xl font-bold text-xl hover-lift group relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            data-testid="button-enter-site"
          >
            <span className="relative z-10 gradient-text-primary font-mono">
              INITIALIZE_CONNECTION()
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-0 group-hover:opacity-20"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
          </motion.button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="neo-border rounded-full p-2">
            <svg className="w-6 h-6 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </motion.div>
      </section>

      {/* Interactive Sections Grid */}
      <section className="py-20 px-6 bg-gradient-to-b from-background to-background/80">
        <motion.div 
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-black gradient-text-primary mb-6 font-mono">
              SYSTEM_MODULES
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-mono">
              Select your interface to access the neural network components
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                className={`relative cursor-pointer group ${index === sections.length - 1 && sections.length % 3 !== 0 ? 'md:col-span-2 lg:col-span-1 lg:col-start-2' : ''}`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                onMouseEnter={() => setHoveredSection(section.id)}
                onMouseLeave={() => setHoveredSection(null)}
                onClick={() => onSectionChange(section.id)}
                whileHover={{ y: -8 }}
                whileTap={{ scale: 0.98 }}
                data-testid={`section-${section.id}`}
              >
                <div className={`glass neo-border rounded-3xl p-8 h-80 flex flex-col justify-between relative overflow-hidden group-hover:glow-primary transition-all duration-300`}>
                  
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div 
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `radial-gradient(circle at 20% 20%, currentColor 2px, transparent 2px)`,
                        backgroundSize: '30px 30px'
                      }}
                    />
                  </div>
                  
                  {/* Animated Border */}
                  <motion.div
                    className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${section.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  />
                  
                  <div className="relative z-10">
                    <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                      {section.icon}
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="text-3xl font-black text-foreground mb-1 font-mono">
                        {section.title}
                      </h3>
                      <p className="text-xl text-muted-foreground font-mono">
                        {section.subtitle}
                      </p>
                    </div>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-mono">
                      {section.description}
                    </p>
                  </div>
                  
                  <div className="relative z-10 flex justify-between items-end">
                    <div className="glass rounded-2xl px-4 py-2">
                      <div className={`text-2xl font-black gradient-text-primary font-mono`}>
                        {section.stats}
                      </div>
                    </div>
                    
                    <motion.div 
                      className="text-muted-foreground group-hover:text-neon-cyan transition-colors"
                      whileHover={{ x: 5 }}
                    >
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                      </svg>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gradient-to-r from-background via-background/50 to-background">
        <motion.div 
          className="max-w-6xl mx-auto px-6 text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-black mb-16 gradient-text-neon font-mono">
            NETWORK_STATUS
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: stats.bands.toString(), label: 'BANDS', icon: '🎸', color: 'neon-cyan' },
              { number: stats.tours.toString(), label: 'TOURS', icon: '🎫', color: 'neon-purple' },
              { number: stats.reviews.toString(), label: 'REVIEWS', icon: '⭐', color: 'electric-blue' },
              { number: stats.photos.toString(), label: 'PHOTOS', icon: '📸', color: 'neon-yellow' }
            ].map((stat, index) => (
              <motion.div 
                key={stat.label}
                className="glass neo-border rounded-3xl p-8 hover-lift group"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className={`text-4xl font-black mb-2 gradient-text-primary font-mono`}>
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-mono font-bold tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6 bg-gradient-to-t from-background to-transparent">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-black mb-8 gradient-text-primary font-mono">
            JOIN_THE_NETWORK
          </h2>
          <p className="text-xl text-muted-foreground mb-12 font-mono max-w-2xl mx-auto">
            Connect with metalheads worldwide. Share your passion. 
            Discover new sounds. Experience the future of metal community.
          </p>
          <motion.button
            onClick={() => onSectionChange('bands')}
            className="glass neo-shadow px-12 py-6 rounded-2xl font-bold text-xl hover-lift group relative overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            data-testid="button-join-network"
          >
            <span className="relative z-10 gradient-text-neon font-mono">
              ESTABLISH_CONNECTION()
            </span>
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}