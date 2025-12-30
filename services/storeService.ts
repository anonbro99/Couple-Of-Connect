
import { supabase } from './supabaseClient';
import { User, Chat, Message, Saving, GalleryPhoto, GameSession, Role, SavingStatus } from '../types';

class StoreService {
  // Profiles
  async getCurrentProfile(uid: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single();
    
    if (error) return null;
    return {
      uid: data.id,
      username: data.username,
      userId: data.user_id,
      displayName: data.display_name,
      photoUrl: data.photo_url,
      role: data.role as any,
      createdAt: new Date(data.created_at).getTime()
    };
  }

  // Added missing method to get all users
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) return [];
    return data.map(d => ({
      uid: d.id,
      username: d.username,
      userId: d.user_id,
      displayName: d.display_name,
      photoUrl: d.photo_url,
      role: d.role as any,
      createdAt: new Date(d.created_at).getTime()
    }));
  }

  async searchUsers(query: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('user_id', `%${query}%`);
    
    if (error) return [];
    return data.map(d => ({
      uid: d.id,
      username: d.username,
      userId: d.user_id,
      displayName: d.display_name,
      photoUrl: d.photo_url,
      role: d.role,
      createdAt: new Date(d.created_at).getTime()
    }));
  }

  // Added missing method for admin to delete user
  async deleteUser(uid: string): Promise<void> {
    await supabase.from('profiles').delete().eq('id', uid);
  }

  // Chats & Messages
  async getChats(uid: string): Promise<Chat[]> {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .contains('members', [uid]);
    
    if (error) return [];
    return data.map(d => ({
      chatId: d.id,
      members: d.members,
      createdAt: new Date(d.created_at).getTime()
    }));
  }

  async getMessages(chatId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('timestamp', { ascending: true });
    
    if (error) return [];
    return data.map(d => ({
      messageId: d.id,
      chatId: d.chat_id,
      senderId: d.sender_id,
      text: d.text,
      timestamp: new Date(d.timestamp).getTime()
    }));
  }

  async sendMessage(msg: Partial<Message>): Promise<void> {
    await supabase.from('messages').insert({
      chat_id: msg.chatId,
      sender_id: msg.senderId,
      text: msg.text
    });
  }

  // Added missing method to create a new chat
  async createChat(chat: Partial<Chat>): Promise<void> {
    await supabase.from('chats').insert({
      members: chat.members
    });
  }

  // Savings
  // Added missing method to get savings
  async getSavings(): Promise<Saving[]> {
    const { data, error } = await supabase
      .from('savings')
      .select('*');
    
    if (error) return [];
    return data.map(d => ({
      savingId: d.id,
      userId: d.user_id,
      userName: d.user_name,
      amount: d.amount,
      paymentMethod: d.payment_method,
      proofImage: d.proof_image_url,
      status: d.status as SavingStatus,
      createdAt: new Date(d.created_at).getTime()
    }));
  }

  // Added missing method to add saving
  async addSaving(saving: Partial<Saving>): Promise<void> {
    await supabase.from('savings').insert({
      user_id: saving.userId,
      user_name: saving.userName,
      amount: saving.amount,
      payment_method: saving.paymentMethod,
      proof_image_url: saving.proofImage,
      status: 'pending'
    });
  }

  // Added missing method to delete saving
  async deleteSaving(id: string): Promise<void> {
    await supabase.from('savings').delete().eq('id', id);
  }

  // Added missing method to update saving status
  async updateSavingStatus(id: string, status: SavingStatus): Promise<void> {
    await supabase.from('savings').update({ status }).eq('id', id);
  }

  // Gallery
  // Added missing method to get gallery photos
  async getGallery(): Promise<GalleryPhoto[]> {
    const { data, error } = await supabase
      .from('gallery')
      .select('*');
    
    if (error) return [];
    return data.map(d => ({
      photoId: d.id,
      imageUrl: d.image_url,
      title: d.title,
      caption: d.caption,
      uploadedBy: d.uploaded_by,
      uploaderName: d.uploader_name,
      isPublic: d.is_public,
      createdAt: new Date(d.created_at).getTime()
    }));
  }

  // Added missing method to add photo
  async addPhoto(photo: Partial<GalleryPhoto>): Promise<void> {
    await supabase.from('gallery').insert({
      image_url: photo.imageUrl,
      title: photo.title,
      caption: photo.caption,
      uploaded_by: photo.uploadedBy,
      uploader_name: photo.uploaderName,
      is_public: photo.isPublic
    });
  }

  // Added missing method to delete photo
  async deletePhoto(id: string): Promise<void> {
    await supabase.from('gallery').delete().eq('id', id);
  }

  // Added missing method to clear all photos
  async clearAllPhotos(): Promise<void> {
    // Note: Supabase requires a filter for deletes. Using a filter that matches all.
    await supabase.from('gallery').delete().neq('id', '0');
  }

  // Storage Upload Helper
  async uploadFile(bucket: string, path: string, base64: string): Promise<string | null> {
    const blob = await (await fetch(base64)).blob();
    const { data, error } = await supabase.storage.from(bucket).upload(path, blob);
    if (error) return null;
    
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return urlData.publicUrl;
  }

  // Game Sessions
  async getGameSession(chatId: string): Promise<GameSession | null> {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('chat_id', chatId)
      .single();
    
    if (error) return null;
    return {
      chatId: data.chat_id,
      turnUid: data.turn_uid,
      currentChallenge: data.current_challenge,
      challengeType: data.challenge_type,
      lastAnswerText: data.last_answer_text,
      lastAnswerImage: data.last_answer_image_url,
      lastAnswerVideo: data.last_answer_video_url,
      lastUpdated: new Date(data.last_updated).getTime()
    };
  }

  // Updated to handle both update and delete (by passing null)
  async updateGameSession(session: Partial<GameSession> | null, chatIdOverride?: string): Promise<void> {
    if (!session) {
      if (chatIdOverride) {
        await supabase.from('game_sessions').delete().eq('chat_id', chatIdOverride);
      }
      return;
    }

    const { error } = await supabase
      .from('game_sessions')
      .upsert({
        chat_id: session.chatId,
        turn_uid: session.turnUid,
        current_challenge: session.currentChallenge,
        challenge_type: session.challengeType,
        last_answer_text: session.lastAnswerText,
        last_answer_image_url: session.lastAnswerImage,
        last_answer_video_url: session.lastAnswerVideo,
        last_updated: new Date().toISOString()
      });
  }
}

export const store = new StoreService();
