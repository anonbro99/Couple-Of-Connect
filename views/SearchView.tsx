
import React, { useState, useEffect } from 'react';
import { User, Chat } from '../types';
import { store } from '../services/storeService';
import { Button } from '../components/Button';
import { Search, UserPlus, MessageCircle, AlertCircle } from 'lucide-react';

interface SearchViewProps {
  currentUser: User;
  onStartChat: () => void;
}

export const SearchView: React.FC<SearchViewProps> = ({ currentUser, onStartChat }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [u, c] = await Promise.all([
        store.getUsers(),
        store.getChats(currentUser.uid)
      ]);
      setAllUsers(u);
      setChats(c);
    };
    fetchData();
  }, [currentUser.uid]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const normalizedQuery = query.startsWith('@') ? query.toLowerCase() : `@${query.toLowerCase()}`;
    const found = allUsers.filter(u => u.userId.toLowerCase().includes(normalizedQuery) && u.uid !== currentUser.uid);
    
    setResults(found);
    setHasSearched(true);
  };

  const startChat = async (partner: User) => {
    const existingChat = chats.find(c => 
      c.members.includes(currentUser.uid) && c.members.includes(partner.uid)
    );

    if (!existingChat) {
      await store.createChat({
        members: [currentUser.uid, partner.uid]
      });
    }
    
    onStartChat();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-900">Connect with your partner</h1>
        <p className="text-slate-500 mt-2">Enter their @username to create a private chat space.</p>
      </div>

      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
          <Search size={22} />
        </div>
        <input 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by @username..."
          className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm focus:border-indigo-500 focus:ring-0 focus:outline-none transition-all text-lg"
        />
        <div className="absolute inset-y-2 right-2">
          <Button type="submit" size="lg" className="h-full">Find User</Button>
        </div>
      </form>

      <div className="space-y-4">
        {results.map(user => (
          <div key={user.uid} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
            <div className="flex items-center gap-4">
              <img src={user.photoUrl} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-slate-50" alt="" />
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{user.displayName}</h3>
                <p className="text-slate-500">{user.userId}</p>
              </div>
            </div>
            <Button onClick={() => startChat(user)} className="gap-2 shadow-lg shadow-indigo-100">
              <MessageCircle size={18} />
              Start Chat
            </Button>
          </div>
        ))}

        {hasSearched && results.length === 0 && (
          <div className="py-16 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
              <AlertCircle size={32} />
            </div>
            <p className="text-slate-500 font-medium">We couldn't find anyone with that ID.</p>
            <p className="text-slate-400 text-sm mt-1">Make sure you have the correct @username.</p>
          </div>
        )}
      </div>

      <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
        <div className="flex gap-4">
          <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm">
            <UserPlus size={24} />
          </div>
          <div>
            <h4 className="font-bold text-indigo-900">Invite your partner</h4>
            <p className="text-sm text-indigo-700/80 leading-relaxed">
              Share your ID <span className="font-extrabold text-indigo-600">{currentUser.userId}</span> with your partner so they can find you and start your private session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
