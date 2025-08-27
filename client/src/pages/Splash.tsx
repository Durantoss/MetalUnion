import { useLocation } from 'wouter';

export default function Splash() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black animate-fade-in">
      <img
        src="/assets/moshunion-splash.png"
        alt="MoshUnion Splash"
        className="w-full max-w-2xl object-contain"
      />
      <button
        onClick={() => setLocation('/home')}
        className="mt-6 px-6 py-3 bg-red-700 hover:bg-red-900 text-white text-lg font-bold rounded tracking-wide"
      >
        ENTER
      </button>
    </div>
  );
}
