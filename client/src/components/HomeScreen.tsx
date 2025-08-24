import { MobileFriendlyLanding } from './MobileFriendlyLanding';
import { Band } from '../types';

interface HomeScreenProps {
  bands: Band[];
  currentUser: any;
  onSectionChange: (section: string) => void;
  onLogin: () => void;
  onLogout: () => void;
}

function HomeScreen({ 
  bands, 
  currentUser, 
  onSectionChange, 
  onLogin, 
  onLogout 
}: HomeScreenProps) {
  return (
    <MobileFriendlyLanding 
      onSectionChange={onSectionChange}
      bands={bands}
      currentUser={currentUser}
      onLogin={onLogin}
      onLogout={onLogout}
    />
  );
}

export default HomeScreen;
