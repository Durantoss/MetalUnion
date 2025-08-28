export interface UserProfile {
  id: string;
  username: string;
  avatar?: string;
  location?: string;
  favoriteGenres: string[];
  favoriteBands: string[];
  contentPreferences: {
    showTours: boolean;
    showReviews: boolean;
    showPhotos: boolean;
    showSocial: boolean;
  };
  notificationSettings: {
    newBands: boolean;
    tourAlerts: boolean;
    socialActivity: boolean;
    weeklyDigest: boolean;
  };
  onboardingCompleted: boolean;
  createdAt: Date;
}

export interface OnboardingState {
  currentStep: number;
  username?: string;
  avatar?: string;
  location?: string;
  genres: string[];
  bands: string[];
  contentPrefs: string[];
  notificationPrefs: string[];
}

export const METAL_GENRES = [
  'Death Metal',
  'Black Metal',
  'Thrash Metal',
  'Progressive Metal',
  'Power Metal',
  'Doom Metal',
  'Sludge Metal',
  'Stoner Metal',
  'Metalcore',
  'Deathcore',
  'Post Metal',
  'Symphonic Metal',
  'Folk Metal',
  'Industrial Metal',
  'Nu Metal',
  'Groove Metal',
  'Heavy Metal',
  'Speed Metal'
];

export const CONTENT_PREFERENCES = [
  { id: 'showTours', label: 'Tour & Concert Updates', description: 'Get notified about upcoming shows' },
  { id: 'showReviews', label: 'Band Reviews', description: 'See reviews and ratings from the community' },
  { id: 'showPhotos', label: 'Concert Photos', description: 'Browse concert photography and fan pics' },
  { id: 'showSocial', label: 'Social Features', description: 'Connect with other metalheads in The Pit' }
];

export const NOTIFICATION_PREFERENCES = [
  { id: 'newBands', label: 'New Band Discoveries', description: 'When new bands are added to the platform' },
  { id: 'tourAlerts', label: 'Tour Alerts', description: 'When your favorite bands announce tours' },
  { id: 'socialActivity', label: 'Social Activity', description: 'Comments, likes, and mentions' },
  { id: 'weeklyDigest', label: 'Weekly Digest', description: 'Summary of platform activity and recommendations' }
];
