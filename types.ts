
export type Role = 'admin' | 'user';

export interface User {
  uid: string;
  username: string;
  userId: string; // e.g., @username
  displayName: string;
  photoUrl: string;
  role: Role;
  createdAt: number;
}

export interface Message {
  messageId: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface Chat {
  chatId: string;
  members: string[]; // array of uids
  createdAt: number;
}

export interface GameSession {
  chatId: string;
  turnUid: string; // UID user yang sedang giliran
  currentChallenge: string | null;
  challengeType: 'truth' | 'dare' | null;
  lastAnswerText: string | null;
  lastAnswerImage: string | null;
  lastAnswerVideo: string | null; // Base64 encoded video
  lastUpdated: number;
}

export type SavingStatus = 'pending' | 'accepted' | 'rejected';
export type PaymentMethod = 'QRIS' | 'DANA';

export interface Saving {
  savingId: string;
  userId: string;
  userName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  proofImage: string; // Base64 or URL
  status: SavingStatus;
  createdAt: number;
}

export interface GalleryPhoto {
  photoId: string;
  imageUrl: string;
  title: string;
  caption: string;
  uploadedBy: string; // uid
  uploaderName: string;
  isPublic: boolean;
  createdAt: number;
}
