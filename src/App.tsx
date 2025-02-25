import React, { useState } from 'react';
import { Mountain, Heart, WifiOff, Home, Menu, X } from 'lucide-react';
import { UserPreferences } from './types';
import ParkForm from './components/ParkForm';
import ParkResults from './components/ParkResults';
import { useQuery } from 'react-query';
import { getParks } from './services/npsApi';
import { useAuth } from './hooks/useAuth';
import AuthModal from './components/auth/AuthModal';
import UserMenu from './components/auth/UserMenu';
import ProfileSettings from './components/profile/ProfileSettings';
import FavoriteParks from './components/FavoriteParks';
import OfflineIndicator from './components/OfflineIndicator';
import { saveParks, getParksForState } from './lib/db';
import { useOfflineStatus } from './hooks/useOfflineStatus';
import DonationSection from './components/DonationSection';
import ScrollToTop from './components/ScrollToTop';

function App() {
  const [searchParams, setSearchParams] = useState<UserPreferences | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [initialAuthMode, setInitialAuthMode] = useState<'login' | 'signup'>('login');
  const [showProfile, setShowProfile] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const isOffline = useOfflineStatus();

  const { data: parks, isLoading, error } = useQuery(
    ['parks', searchParams?.state],
    async () => {
      if (!searchParams?.state) return [];

      try {
        if (!isOffline) {
          const parks = await getParks(searchParams.state);
          await saveParks(parks);
          return parks;
        }
      } catch (error) {
        console.error('Error fetching parks:', error);
      }

      return getParksForState(searchParams.state);
    },
    {
      enabled: !!searchParams?.state && searchParams.activities.length > 0,
      staleTime: 300000
    }
  );

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setInitialAuthMode(mode);
    setIsAuthModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleProfileClick = () => {
    setShowProfile(true);
    setShowFavorites(false);
    setIsMenuOpen(false);
  };

  const handleFavoritesClick = () => {
    setShowFavorites(true);
    setShowProfile(false);
    setIsMenuOpen(false);
  };

  const handleHomeClick = () => {
    setShowProfile(false);
    setShowFavorites(false);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      <header className="bg-green-800 text-white py-6 shadow-lg relative select-none">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 pointer-events-none">
              <Mountain className="h-8 w-8" />
              <h1 className="text-2xl font-bold">National Park Explorer</h1>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-white p-2 hover:bg-green-700 rounded-md"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-4">
              <button
                onClick={handleHomeClick}
                className="flex items-center space-x-2 px-4 py-2 bg-green-700 rounded-md hover:bg-green-600 transition-colors"
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </button>

              {user && (
                <button
                  onClick={handleFavoritesClick}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-700 rounded-md hover:bg-green-600 transition-colors"
                >
                  <Heart className="h-5 w-5" />
                  <span>Favorites</span>
                </button>
              )}

              {!authLoading && (
                user ? (
                  <UserMenu user={user} onProfileClick={handleProfileClick} />
                ) : (
                  <div className="space-x-4">
                    <button
                      onClick={() => handleAuthClick('login')}
                      className="bg-white text-green-800 px-4 py-2 rounded-md hover:bg-green-50 transition-colors"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => handleAuthClick('signup')}
                      className="bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                    >
                      Sign Up
                    </button>
                  </div>
                )
              )}
            </nav>
          </div>

          {/* Mobile Navigation Menu */}
          <div
            className={`
              lg:hidden fixed inset-x-0 top-[88px] bg-green-800 border-t border-green-700
              transition-all duration-300 ease-in-out z-50
              ${isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}
            `}
          >
            <nav className="container mx-auto px-4 py-4">
              <div className="flex flex-col space-y-2">
                <button
                  onClick={handleHomeClick}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-700 rounded-md hover:bg-green-600 transition-colors"
                >
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                </button>

                {user && (
                  <button
                    onClick={handleFavoritesClick}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-700 rounded-md hover:bg-green-600 transition-colors"
                  >
                    <Heart className="h-5 w-5" />
                    <span>Favorites</span>
                  </button>
                )}

                {!authLoading && (
                  user ? (
                    <UserMenu user={user} onProfileClick={handleProfileClick} isMobile={true} />
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => handleAuthClick('login')}
                        className="bg-white text-green-800 px-4 py-2 rounded-md hover:bg-green-50 transition-colors w-full"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => handleAuthClick('signup')}
                        className="bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors w-full"
                      >
                        Sign Up
                      </button>
                    </div>
                  )
                )}
              </div>
            </nav>
          </div>

          <p className="mt-2 text-green-100 pointer-events-none">Discover your perfect outdoor adventure</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {showProfile ? (
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Profile Settings</h2>
              <button
                onClick={handleHomeClick}
                className="text-green-600 hover:text-green-700"
              >
                Back to Search
              </button>
            </div>
            <ProfileSettings />
          </div>
        ) : showFavorites ? (
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <FavoriteParks />
              <button
                onClick={handleHomeClick}
                className="text-green-600 hover:text-green-700"
              >
                Back to Search
              </button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-xl p-6 sticky top-8">
                <ParkForm onSearch={setSearchParams} isLoading={isLoading} />
              </div>
            </div>

            <div className="lg:col-span-2">
              <ParkResults
                parks={parks}
                isLoading={isLoading}
                error={error}
                preferences={searchParams}
              />
            </div>
          </div>
        )}
      </main>

      <footer className="bg-green-900 text-white py-4 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div>© 2025 National Park Explorer. Find your next adventure!</div>
            <DonationSection />
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={initialAuthMode}
      />
      <OfflineIndicator />
      <ScrollToTop />
    </div>
  );
}

export default App;