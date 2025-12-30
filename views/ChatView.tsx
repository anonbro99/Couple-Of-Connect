
import React, { useState, useEffect, useRef } from 'react';
import { User, Message, Chat } from '../types';
import { store } from '../services/storeService';
import { Button } from '../components/Button';
import { Send, Image as ImageIcon, Search, Phone, Video, MoreVertical, MessageSquare, Gamepad2, Sparkles, Heart } from 'lucide-react';

interface ChatViewProps {
  currentUser: User;
  onNavigate?: (view: any) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ currentUser, onNavigate }) => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const chats = store.getChats().filter(c => c.members.includes(currentUser.uid));
  const users = store.getUsers();

  const getPartner = (chat: Chat) => {
    const partnerId = chat.members.find(id => id !== currentUser.uid);
    return users.find(u => u.uid === partnerId);
  };

  useEffect(() => {
    if (selectedChat) {
      setMessages(store.getMessages(selectedChat.chatId));
    }
  }, [selectedChat]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (textOverride?: string) => {
    const textToSend = textOverride || inputText;
    if (!textToSend.trim() || !selectedChat) return;

    const newMessage: Message = {
      messageId: Math.random().toString(36).substr(2, 9),
      chatId: selectedChat.chatId,
      senderId: currentUser.uid,
      text: textToSend,
      timestamp: Date.now()
    };

    store.sendMessage(newMessage);
    setMessages([...messages, newMessage]);
    if (!textOverride) setInputText('');
  };

  const sendGameInvite = () => {
    handleSendMessage("[GAME_INVITE]");
  };

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center px-6">
        <div className="w-20 h-20 bg-indigo-500/10 text-indigo-400 rounded-3xl flex items-center justify-center mb-6 border border-indigo-500/20">
          <Search size={40} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-tighter">No Neural Links Found</h2>
        <p className="text-slate-500 max-w-xs mb-6 text-sm font-medium">Find your partner first to initiate a secure 1-to-1 session.</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] md:h-[calc(100vh-8rem)] glass border border-white/5 rounded-[40px] overflow-hidden shadow-2xl animate-in fade-in duration-700">
      {/* Chats Sidebar */}
      <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-white/5 bg-slate-900/40 backdrop-blur-3xl`}>
        <div className="p-8 border-b border-white/5">
          <h3 className="font-black text-white text-xs uppercase tracking-[0.3em]">Neural Channels</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {chats.map(chat => {
            const partner = getPartner(chat);
            return (
              <button
                key={chat.chatId}
                onClick={() => setSelectedChat(chat)}
                className={`w-full flex items-center gap-4 p-4 rounded-[24px] transition-all duration-300 border ${
                  selectedChat?.chatId === chat.chatId 
                  ? 'bg-indigo-600/10 border-indigo-500/30 text-white shadow-lg' 
                  : 'bg-transparent border-transparent text-slate-500 hover:bg-white/5 hover:text-slate-300'
                }`}
              >
                <img src={partner?.photoUrl} className="w-12 h-12 rounded-2xl object-cover shadow-lg border border-white/10" alt="" />
                <div className="text-left overflow-hidden">
                  <p className="font-black text-sm truncate tracking-tight">{partner?.displayName}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 truncate">{partner?.userId}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      {selectedChat ? (
        <div className={`${selectedChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-slate-900/20 relative`}>
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-950/20 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <button className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white transition-colors" onClick={() => setSelectedChat(null)}>
                <Search size={20} className="rotate-180" />
              </button>
              <div className="relative">
                <img src={getPartner(selectedChat)?.photoUrl} className="w-12 h-12 rounded-2xl object-cover border border-white/10 shadow-xl" alt="" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              </div>
              <div>
                <p className="font-black text-white text-base tracking-tight">{getPartner(selectedChat)?.displayName}</p>
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mt-0.5">Secure Neural Connection</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" className="p-3 bg-white/5 rounded-2xl border border-white/5 text-slate-400 hover:text-indigo-400"><Phone size={18} /></Button>
              <Button variant="ghost" size="sm" className="p-3 bg-white/5 rounded-2xl border border-white/5 text-slate-400 hover:text-rose-400"><Video size={18} /></Button>
              <Button variant="ghost" size="sm" className="p-3 bg-white/5 rounded-2xl border border-white/5 text-slate-400 hover:text-white"><MoreVertical size={18} /></Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {messages.map(msg => {
              const isGameInvite = msg.text === "[GAME_INVITE]";
              
              return (
                <div key={msg.messageId} className={`flex ${msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                  {isGameInvite ? (
                    <div className={`max-w-[85%] w-80 glass rounded-[32px] p-6 border transition-all hover:scale-[1.02] ${
                      msg.senderId === currentUser.uid 
                      ? 'bg-indigo-600/20 border-indigo-500/30' 
                      : 'bg-rose-600/20 border-rose-500/30'
                    }`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Gamepad2 size={20} className={msg.senderId === currentUser.uid ? 'text-indigo-400' : 'text-rose-400'} />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Neural Play</span>
                        </div>
                        <Sparkles size={16} className="text-amber-400 animate-pulse" />
                      </div>
                      <h4 className="text-lg font-black text-white leading-tight mb-4">Undangan Bermain Truth or Dare! 🎮</h4>
                      <Button 
                        fullWidth 
                        onClick={() => onNavigate?.('game')}
                        className={`h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl ${
                          msg.senderId === currentUser.uid ? 'bg-indigo-600' : 'bg-rose-600'
                        }`}
                      >
                        Main Sekarang
                      </Button>
                    </div>
                  ) : (
                    <div className={`max-w-[75%] px-6 py-4 rounded-[28px] shadow-2xl relative group border ${
                      msg.senderId === currentUser.uid 
                        ? 'bg-indigo-600 text-white rounded-tr-none border-indigo-500/30' 
                        : 'bg-white/10 backdrop-blur-md text-slate-200 rounded-tl-none border-white/5'
                    }`}>
                      <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                      <p className={`text-[9px] font-black uppercase tracking-widest mt-2 opacity-50 ${msg.senderId === currentUser.uid ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
            className="p-6 border-t border-white/5 bg-slate-950/40 backdrop-blur-2xl"
          >
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-[30px] px-6 py-2 transition-all focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/5">
              <div className="flex items-center gap-2">
                <button type="button" className="text-slate-500 hover:text-indigo-400 transition-colors p-2"><ImageIcon size={22} /></button>
                <button 
                  type="button" 
                  onClick={sendGameInvite}
                  className="text-slate-500 hover:text-amber-400 transition-colors p-2 group"
                >
                  <Gamepad2 size={22} className="group-hover:rotate-12 transition-transform" />
                </button>
              </div>
              <input 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your neural message..."
                className="flex-1 bg-transparent py-4 focus:outline-none text-sm text-white placeholder:text-slate-600 font-medium"
              />
              <button 
                type="submit"
                disabled={!inputText.trim()}
                className="bg-indigo-600 text-white disabled:opacity-30 disabled:grayscale p-3 rounded-2xl hover:bg-indigo-500 transition-all shadow-xl active:scale-95 group"
              >
                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center text-slate-500 p-20 text-center animate-in fade-in duration-1000">
          <div className="w-24 h-24 bg-white/5 rounded-[40px] flex items-center justify-center mb-8 border border-white/5 shadow-inner">
            <MessageSquare size={48} strokeWidth={1} className="opacity-20" />
          </div>
          <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Neural Terminal Standby</h4>
          <p className="text-sm font-medium text-slate-600 max-w-xs uppercase tracking-widest">Select a synchronized partner channel to begin messaging.</p>
        </div>
      )}
    </div>
  );
};
