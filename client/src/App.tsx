import { BandListPage } from './components/BandListPage';
import { LoginPage } from './components/LoginPage';

function App() {
  // Simple hardcoded auth state to test if the basic structure works
  const isAuthenticated = false;
  const isLoading = false;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4 text-red-600">METALHUB</div>
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {isAuthenticated ? <BandListPage /> : <LoginPage />}
    </div>
  );
}

export default App;