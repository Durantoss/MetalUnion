import { Link } from 'wouter';

interface HeaderProps {
  currentSection?: string;
  onSectionChange?: (section: string) => void;
  onReturnHome?: () => void;
}

export default function Header({ currentSection, onSectionChange, onReturnHome }: HeaderProps) {
  const handleLogoClick = () => {
    if (onReturnHome && typeof onReturnHome === 'function') {
      onReturnHome();
    } else if (onSectionChange) {
      onSectionChange('landing');
    }
  };

  const handleNavClick = (section: string) => {
    if (onSectionChange) {
      onSectionChange(section);
    }
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-black border-b border-red-700">
      <button onClick={handleLogoClick} className="cursor-pointer">
        {/* Try the new logo first, fallback to existing logo, then fallback to text */}
        <img
          src="/assets/moshunion-logo.png"
          alt="MoshUnion Logo"
          className="h-12 md:h-16 hover:drop-shadow-[0_0_10px_red] transition"
          onError={(e) => {
            // First fallback: try the existing logo
            const target = e.target as HTMLImageElement;
            if (target.src.includes('moshunion-logo.png')) {
              target.src = '/assets/moshunion-logo.jpeg.png';
            } else {
              // Second fallback: hide image and show text logo
              target.style.display = 'none';
              const textLogo = target.nextElementSibling as HTMLElement;
              if (textLogo) {
                textLogo.style.display = 'block';
              }
            }
          }}
        />
        <div 
          className="text-2xl md:text-3xl font-bold hidden"
          style={{ fontFamily: 'serif' }}
        >
          <span className="text-red-500">MOSH</span>
          <span className="text-white">UNION</span>
        </div>
      </button>
      <nav className="flex gap-4 text-white">
        <button 
          onClick={() => handleNavClick('memories')}
          className={`hover:text-red-500 transition px-3 py-2 rounded ${currentSection === 'memories' ? 'text-red-500 bg-red-900/20' : ''}`}
        >
          Memories
        </button>
        <button 
          onClick={() => handleNavClick('social')}
          className={`hover:text-red-500 transition px-3 py-2 rounded ${currentSection === 'social' ? 'text-red-500 bg-red-900/20' : ''}`}
        >
          Collab Wall
        </button>
        <button 
          onClick={() => handleNavClick('profile')}
          className={`hover:text-red-500 transition px-3 py-2 rounded ${currentSection === 'profile' ? 'text-red-500 bg-red-900/20' : ''}`}
        >
          Profile
        </button>
      </nav>
    </header>
  );
}
