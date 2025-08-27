export interface Band {
  id: string;
  name: string;
  genre: string;
  description: string;
  imageUrl?: string;
  founded?: number;
  members?: string[];
  albums?: string[];
  website?: string;
  instagram?: string;
}

export interface Stub {
  id: string;
  user_id: string;
  artist: string;
  venue: string;
  date: string;
  genre: 'thrash' | 'doom' | 'metalcore' | string;
  stub_url?: string;
  image_url?: string;
  tags: string[];
  friends: string[];
  privacy: 'public' | 'friends' | 'private';
}

export interface StubSubmission {
  stubUrl: string;
  imageFile: File | null;
}

export interface StubCardProps {
  stub: Stub;
  genre: string;
}

export interface MemoryWallProps {
  stubs: Stub[];
}

export interface TimelinePulseProps {
  stubs: Stub[];
}

export interface FanCollabProps {
  stub: Stub;
  onTag: (friendName: string) => void;
}

export interface PrivacyToggleProps {
  value: 'public' | 'friends' | 'private';
  onChange: (value: 'public' | 'friends' | 'private') => void;
}

export interface StubLinkProps {
  onSubmit: (submission: StubSubmission) => void;
}
