
import { User, Chat, Message, Saving, GalleryPhoto, GameSession } from '../types';

const STORAGE_KEYS = {
  USERS: 'cc_users',
  CHATS: 'cc_chats',
  MESSAGES: 'cc_messages',
  SAVINGS: 'cc_savings',
  GALLERY: 'cc_gallery',
  CURRENT_USER: 'cc_current_user',
  GAME_SESSIONS: 'cc_game_sessions'
};

class StoreService {
  private get<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private set<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Auth & Users
  getUsers(): User[] {
    return this.get<User>(STORAGE_KEYS.USERS);
  }

  saveUser(user: User): void {
    const users = this.getUsers();
    this.set(STORAGE_KEYS.USERS, [...users, user]);
  }

  getCurrentUser(): User | null {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  }

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  // Chats
  getChats(): Chat[] {
    return this.get<Chat>(STORAGE_KEYS.CHATS);
  }

  createChat(chat: Chat): void {
    const chats = this.getChats();
    this.set(STORAGE_KEYS.CHATS, [...chats, chat]);
  }

  getMessages(chatId: string): Message[] {
    return this.get<Message>(STORAGE_KEYS.MESSAGES).filter(m => m.chatId === chatId);
  }

  sendMessage(msg: Message): void {
    const messages = this.get<Message>(STORAGE_KEYS.MESSAGES);
    this.set(STORAGE_KEYS.MESSAGES, [...messages, msg]);
  }

  // Game Sessions
  getGameSession(chatId: string): GameSession | null {
    const sessions = this.get<GameSession>(STORAGE_KEYS.GAME_SESSIONS);
    return sessions.find(s => s.chatId === chatId) || null;
  }

  updateGameSession(session: GameSession | null, chatId?: string): void {
    const sessions = this.get<GameSession>(STORAGE_KEYS.GAME_SESSIONS);
    const filtered = sessions.filter(s => s.chatId !== (session ? session.chatId : chatId));
    if (session) {
      this.set(STORAGE_KEYS.GAME_SESSIONS, [...filtered, session]);
    } else {
      this.set(STORAGE_KEYS.GAME_SESSIONS, filtered);
    }
  }

  // Savings
  getSavings(): Saving[] {
    return this.get<Saving>(STORAGE_KEYS.SAVINGS);
  }

  addSaving(saving: Saving): void {
    const savings = this.getSavings();
    this.set(STORAGE_KEYS.SAVINGS, [...savings, saving]);
  }

  updateSavingStatus(savingId: string, status: 'accepted' | 'rejected'): void {
    const savings = this.getSavings();
    this.set(STORAGE_KEYS.SAVINGS, savings.map(s => s.savingId === savingId ? { ...s, status } : s));
  }

  deleteSaving(savingId: string): void {
    const savings = this.getSavings();
    this.set(STORAGE_KEYS.SAVINGS, savings.filter(s => s.savingId !== savingId));
  }

  // Gallery
  getGallery(): GalleryPhoto[] {
    return this.get<GalleryPhoto>(STORAGE_KEYS.GALLERY);
  }

  addPhoto(photo: GalleryPhoto): void {
    const gallery = this.getGallery();
    this.set(STORAGE_KEYS.GALLERY, [...gallery, photo]);
  }

  deletePhoto(photoId: string): void {
    const gallery = this.getGallery();
    this.set(STORAGE_KEYS.GALLERY, gallery.filter(p => p.photoId !== photoId));
  }

  clearAllPhotos(): void {
    this.set(STORAGE_KEYS.GALLERY, []);
  }

  // Admin Actions
  deleteUser(uid: string): void {
    const users = this.getUsers().filter(u => u.uid !== uid);
    this.set(STORAGE_KEYS.USERS, users);
  }
}

export const store = new StoreService();
