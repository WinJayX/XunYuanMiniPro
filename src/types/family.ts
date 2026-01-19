/**
 * Family types - shared with web version
 */

// Photo crop parameters
export interface PhotoCrop {
  x: number;      // Offset X (percentage)
  y: number;      // Offset Y (percentage)
  scale: number;  // Scale ratio
}

// Story type
export interface Story {
  id: number;
  title: string;
  year?: number | null;
  content: string;
  photos?: string[];  // Story related photos
  createdAt?: string;
}

// Family member type
export interface Member {
  id: number;
  apiId?: string;  // API ID for server sync
  name: string;
  gender: 'male' | 'female';
  birthOrder?: number | null;
  birthYear?: number | null;
  deathYear?: number | null;
  hometown?: string;
  bio?: string;
  photo?: string;
  photoCrop?: PhotoCrop;
  parentId?: number | string | null;
  motherId?: number | string | null;      // ID of the biological mother (for multiple spouses)
  spouseId?: number;
  spouseIds?: (number | string)[];
  // Albums and stories
  albums?: string[];     // Album photo URLs
  stories?: Story[];     // Story list
}

// Generation type
export interface Generation {
  id: number;
  apiId?: string;  // API ID for server sync
  name: string;
  members: Member[];
}

// Settings type
export interface Settings {
  familyName: string;
  subtitle?: string;
  familySubtitle?: string;  // Alias for subtitle
  hometown: string;
  theme: 'classic' | 'modern' | 'warm' | 'elegant' | string;
  bgImages?: string[];
  backgroundImages?: string[];  // Alias for bgImages
  showConnections: boolean;
  zoomLevel: number;  // Zoom level (0.5 = 50%, 1 = 100%, etc.)
}

// Family data type
export interface FamilyData {
  settings: Settings;
  generations: Generation[];
  apiId?: string;  // API ID for server sync
}

// Zodiac type
export interface Zodiac {
  animal: string;
  emoji: string;
}

// User type
export interface User {
  id: string;
  email: string;
  nickname: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'user';
  status: 'active' | 'disabled';
}

// Family list item
export interface FamilyListItem {
  id: string;
  name: string;
  subtitle?: string;
  hometown?: string;
  theme: string;
  updatedAt: string;
}
