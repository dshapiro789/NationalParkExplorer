import React, { useState } from 'react';
import { User, LogOut, Settings } from 'lucide-react';
import { useProfile } from '../../hooks/useProfile';
import { useAuth } from '../../hooks/useAuth';

interface UserMenuProps {
  user: any;
  onProfileClick: () => void;
  isMobile?: boolean;
}

export default function UserMenu({ user, onProfileClick, isMobile = false }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { profile } = useProfile(user?.id);
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    if (isSigningOut) return;
    
    try {
      setIsSigningOut(true);
      const { error } = await signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        setIsSigningOut(false);
      }
    } catch (error) {
      console.error('Error signing out:', error);
      setIsSigningOut(false);
    }
  };

  const handleProfileSettings = () => {
    setIsOpen(false);
    onProfileClick();
  };

  if (isMobile) {
    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-3 px-2 py-1">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile?.username || 'User'}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <User className="w-8 h-8 p-1 bg-green-100 rounded-full text-green-600" />
          )}
          <div>
            <p className="font-medium text-white">{profile?.username || 'User'}</p>
            <p className="text-sm text-green-100">{user.email}</p>
          </div>
        </div>
        
        <button
          onClick={handleProfileSettings}
          className="flex items-center w-full px-4 py-2 text-white hover:bg-green-700 rounded-md transition-colors"
        >
          <Settings className="h-4 w-4 mr-2" />
          Profile Settings
        </button>

        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="flex items-center w-full px-4 py-2 text-white hover:bg-green-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {isSigningOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-full hover:bg-green-50"
      >
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile?.username || 'User'}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <User className="w-8 h-8 p-1 bg-green-100 rounded-full text-green-600" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
          <div className="px-4 py-2 border-b">
            <p className="text-sm font-medium text-gray-900">
              {profile?.username || 'User'}
            </p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>

          <button
            onClick={handleProfileSettings}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Settings className="h-4 w-4 mr-2" />
            Profile Settings
          </button>

          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isSigningOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      )}
    </div>
  );
}