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
      <div className="logo-image">
        <svg width="400" height="120" viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <style>
              {`
                .text {
                  font-family: 'Oswald', sans-serif;
                  font-weight: 900;
                  font-size: 64px;
                  fill: white;
                  letter-spacing: 4px;
                  text-transform: uppercase;
                }
                .highlight {
                  fill: #B00020;
                }
                .distress {
                  filter: url(#roughen);
                }
              `}
            </style>
            <filter id="roughen">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" result="noise"/>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G"/>
            </filter>
          </defs>

          <text x="10" y="80" className="text highlight distress">M</text>
          <text x="310" y="80" className="text highlight distress">U</text>
          <text x="60" y="80" className="text distress">osh</text>
          <text x="160" y="80" className="text distress">Union</text>
        </svg>
      </div>
      <p className="tagline">UNITED BY SOUND. FORGED IN NOISE.</p>
      <button className="enter-button" onClick={handleEnter}>
        ENTER THE PIT
      </button>
    </div>
  );
}

export default SplashScreen;
