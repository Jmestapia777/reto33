export enum UserRole {
  MASTER = 'MASTER',
  ADMIN = 'ADMIN',
  R33 = 'R33',
  USER = 'USER',
}

export enum City {
  SANTO_DOMINGO = 'Santo Domingo',
  LA_CONCORDIA = 'La Concordia',
}

export interface User {
  id: string;
  email: string;
  password?: string; // Only for auth check, usually hashed in real apps
  name: string;
  surname: string;
  age: number;
  phone: string;
  city: City;
  sector: string;
  role: UserRole;
  avatar?: string;
  tickets: number[]; // Array of ticket numbers (1-50000)
  bio?: string; // For R33
  pdfUrl?: string; // For R33 CV
  installationHistory: string[];
  pollHistory: string[];
  friends: string[]; // User IDs
  following: string[]; // User IDs
}

export interface VoteRecord {
  optionId: string;
  age: number;
  sector: string;
  timestamp: number;
}

export interface PollOption {
  id: string;
  text: string;
  imageUrl?: string;
  votes: number;
}

export interface Poll {
  id: string;
  title: string;
  category: 'Alcalde' | 'Prefecto' | 'Obras' | 'Nacional';
  options: PollOption[];
  active: boolean;
  voteRecords?: VoteRecord[]; // Added for statistics
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string;
  likes: string[]; // User IDs
  shares: number;
  comments: Comment[];
  timestamp: number;
  isShared?: boolean;
  originalAuthorId?: string;
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  timestamp: number;
}

export interface Prize {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  active: boolean; // True if for current week
}

export interface Winner {
  id: string;
  userId: string;
  prizeId: string;
  prizeTitle: string;
  date: string; // ISO date
  userName: string;
  ticketNumber: number;
}

export interface RaffleResult {
  winnerTicket: number;
  winnerUserId: string;
  annulledTickets: number[];
  date: string;
}

export interface AppInstaller {
  id: string;
  name: string;
  version: string;
  category: 'Movies' | 'Music' | 'Games' | 'Tutorial';
  downloadUrl: string;
  warningMessage?: string;
  warningTitle?: string;
}