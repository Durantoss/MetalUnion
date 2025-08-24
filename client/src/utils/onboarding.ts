import { OnboardingState, UserProfile } from '../types/UserProfile';

const STORAGE_KEY = 'moshUnionOnboarding';

export const saveOnboardingState = (state: OnboardingState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save onboarding state:', error);
  }
};

export const loadOnboardingState = (): OnboardingState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Failed to load onboarding state:', error);
    return null;
  }
};

export const clearOnboardingState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear onboarding state:', error);
  }
};

export const validateOnboardingStep = (step: number, state: OnboardingState): boolean => {
  switch (step) {
    case 1: // Profile Setup
      return !!(state.username && state.username.trim().length >= 3);
    case 2: // Genre Selection
      return state.genres.length > 0;
    case 3: // Band Selection
      return state.bands.length > 0;
    case 4: // Preferences Setup
      return state.contentPrefs.length > 0 || state.notificationPrefs.length > 0;
    default:
      return false;
  }
};

export const createUserProfileFromOnboarding = (state: OnboardingState, userId: string): Partial<UserProfile> => {
  return {
    id: userId,
    username: state.username || '',
    avatar: state.avatar,
    location: state.location,
    favoriteGenres: state.genres,
    favoriteBands: state.bands,
    contentPreferences: {
      showTours: state.contentPrefs.includes('showTours'),
      showReviews: state.contentPrefs.includes('showReviews'),
      showPhotos: state.contentPrefs.includes('showPhotos'),
      showSocial: state.contentPrefs.includes('showSocial'),
    },
    notificationSettings: {
      newBands: state.notificationPrefs.includes('newBands'),
      tourAlerts: state.notificationPrefs.includes('tourAlerts'),
      socialActivity: state.notificationPrefs.includes('socialActivity'),
      weeklyDigest: state.notificationPrefs.includes('weeklyDigest'),
    },
    onboardingCompleted: true,
    createdAt: new Date(),
  };
};

export const submitOnboardingData = async (state: OnboardingState, userId: string): Promise<boolean> => {
  try {
    const profileData = createUserProfileFromOnboarding(state, userId);
    
    const response = await fetch('/api/user/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(profileData),
    });

    if (response.ok) {
      clearOnboardingState();
      return true;
    } else {
      console.error('Failed to submit onboarding data:', response.statusText);
      return false;
    }
  } catch (error) {
    console.error('Error submitting onboarding data:', error);
    return false;
  }
};

export const getOnboardingProgress = (state: OnboardingState): number => {
  const totalSteps = 4;
  let completedSteps = 0;

  if (state.username && state.username.trim().length >= 3) completedSteps++;
  if (state.genres.length > 0) completedSteps++;
  if (state.bands.length > 0) completedSteps++;
  if (state.contentPrefs.length > 0 || state.notificationPrefs.length > 0) completedSteps++;

  return Math.round((completedSteps / totalSteps) * 100);
};
