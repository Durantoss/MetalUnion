import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import './styles/SplashScreen.css';

interface SplashScreenProps {
  onEnter?: () => void;
}

function SplashScreen({ onEnter }: SplashScreenProps) {
  const [, setLocation] = useLocation();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100); // Delay for fade-in
    return () => clearTimeout(timer);
  }, []);

  const handleEnter = () => {
    if (onEnter) {
      onEnter();
    }
    setLocation('/home');
  };

  return (
    <div className={`splash-container ${loaded ? 'loaded' : ''}`}>
      <div className="splash-logo">
        <img
          src="/assets/moshunion-logo.jpeg.png"
          alt="MoshUnion Logo"
          className="logo"
        />
      </div>
      <p className="tagline">UNITED BY SOUND. FORGED IN NOISE.</p>
      <button className="enter-button" onClick={handleEnter}>
        ENTER THE PIT
      </button>
    </div>
  );
}

export default SplashScreen;
