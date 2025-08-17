import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModernNavigationProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  onShowComparison: () => void;
  onShowLogin: () => void;
  onReturnHome?: () => void;
}

export function ModernNavigation({ 
  currentSection, 
  onSectionChange, 
  onShowComparison, 
  onShowLogin, 
  onReturnHome 
}: ModernNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [animatingWord, setAnimatingWord] = useState<'mosh' | 'union' | null>(null);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = () => {
    setAnimatingWord('mosh');
    setTimeout(() => {
      setAnimatingWord('union');
      setTimeout(() => {
        setAnimatingWord(null);
        if (onReturnHome && typeof onReturnHome === 'function') {
          onReturnHome();
        } else {
          onSectionChange('landing');
        }
      }, 150);
    }, 150);
  };

  const navItems = [
    { id: 'bands', label: 'DISCOVER', icon: '🎸' },
    { id: 'social', label: 'SOCIAL HUB', icon: '🌐' },
    { id: 'feed', label: 'ACTIVITY', icon: '⚡' },
    { id: 'gamification', label: 'LEADERBOARD', icon: '🏆' },
    { id: 'events', label: 'EVENTS', icon: '🎪' },
    { id: 'polls', label: 'POLLS', icon: '🗳️' },
    { id: 'tours', label: 'LIVE', icon: '🎫' },
    { id: 'reviews', label: 'ANALYZE', icon: '⭐' },
    { id: 'photos', label: 'CAPTURE', icon: '📸' },
    { id: 'pit', label: 'CONNECT', icon: '🤘' },
  ];

  return (
    <>
      {/* Modern Navigation Bar */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass-strong' : 'bg-transparent'
        } border-b border-border/50`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <motion.button
            onClick={handleLogoClick}
            className="flex items-center space-x-2 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-2xl font-black font-mono tracking-wider">
              <motion.span
                className={`transition-colors duration-150 ${
                  animatingWord === 'mosh' ? 'text-neon-cyan glow-text' : 'gradient-text-primary'
                }`}
                animate={animatingWord === 'mosh' ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                MOSH
              </motion.span>
              <motion.span
                className={`transition-colors duration-150 ${
                  animatingWord === 'union' ? 'text-neon-cyan glow-text' : 'gradient-text-primary'
                }`}
                animate={animatingWord === 'union' ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                UNION
              </motion.span>
            </div>
            <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse"></div>
          </motion.button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`px-4 py-2 rounded-xl font-mono font-bold text-sm transition-all duration-300 relative ${
                  currentSection === item.id
                    ? 'text-neon-cyan glow-text'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
                {currentSection === item.id && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-cyan rounded-full"
                    layoutId="activeTab"
                    initial={false}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <motion.button
              onClick={onShowComparison}
              className="hidden md:flex glass neo-border px-4 py-2 rounded-xl font-mono font-bold text-sm hover-lift group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-neon-purple group-hover:text-neon-cyan transition-colors">
                COMPARE
              </span>
            </motion.button>

            <motion.button
              onClick={onShowLogin}
              className="glass neo-shadow px-6 py-2 rounded-xl font-mono font-bold text-sm hover-lift group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="gradient-text-primary group-hover:text-neon-cyan transition-colors">
                LOGIN
              </span>
            </motion.button>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden glass neo-border p-2 rounded-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                animate={isOpen ? "open" : "closed"}
                className="w-6 h-6 flex flex-col justify-center items-center"
              >
                <motion.span
                  variants={{
                    closed: { rotate: 0, y: 0 },
                    open: { rotate: 45, y: 6 }
                  }}
                  className="w-6 h-0.5 bg-neon-cyan block absolute"
                />
                <motion.span
                  variants={{
                    closed: { opacity: 1 },
                    open: { opacity: 0 }
                  }}
                  className="w-6 h-0.5 bg-neon-cyan block absolute"
                />
                <motion.span
                  variants={{
                    closed: { rotate: 0, y: 0 },
                    open: { rotate: -45, y: -6 }
                  }}
                  className="w-6 h-0.5 bg-neon-cyan block absolute"
                />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-background/95 backdrop-blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Content */}
            <motion.div
              className="absolute top-20 left-6 right-6 glass-strong neo-border rounded-3xl p-8"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="space-y-4">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    onClick={() => {
                      onSectionChange(item.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center space-x-4 p-4 rounded-2xl font-mono font-bold text-left transition-all duration-300 ${
                      currentSection === item.id
                        ? 'bg-primary/10 text-neon-cyan glow-text'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-lg">{item.label}</span>
                    {currentSection === item.id && (
                      <motion.div
                        className="ml-auto w-2 h-2 rounded-full bg-neon-cyan"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        layoutId="activeMobileTab"
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <div className="space-y-3">
                  <motion.button
                    onClick={() => {
                      onShowComparison();
                      setIsOpen(false);
                    }}
                    className="w-full glass neo-border p-4 rounded-2xl font-mono font-bold hover-lift group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="gradient-text-primary">COMPARE BANDS</span>
                  </motion.button>

                  <motion.button
                    onClick={() => {
                      onShowLogin();
                      setIsOpen(false);
                    }}
                    className="w-full glass neo-shadow p-4 rounded-2xl font-mono font-bold hover-lift group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="gradient-text-neon">SYSTEM LOGIN</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}