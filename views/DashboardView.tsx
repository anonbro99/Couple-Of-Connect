
import React, { useState, useEffect } from 'react';
import { User, Saving, GalleryPhoto, Chat } from '../types';
import { store } from '../services/storeService';
import { Button } from '../components/Button';
import { SavingsChart } from '../components/SavingsChart';
import { Wallet, Image as ImageIcon, MessageSquare, TrendingUp, Users } from 'lucide-react';

interface DashboardViewProps {
  user: User;
  onNavigate: (view: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ user, onNavigate }) => {
  // Use state for asynchronous data
  const [savings, setSavings] = useState<Saving[]>([]);
  const [gallery, setGallery] = useState<GalleryPhoto[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [s, g, c] = await Promise.all([
        store.getSavings(),
        store.getGallery(),
        store.getChats(user.uid)
      ]);
      setSavings(s);
      setGallery(g);
      setChats(c);
    };
    fetchData();
  }, [user.uid]);
  
  const acceptedSavings = savings.filter(s => s.status === 'accepted');
  const totalBalance = acceptedSavings.reduce((acc, curr) => acc + curr.amount, 0);
  const pendingSavingsCount = savings.filter(s => s.status === 'pending').length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hello, {user.displayName}!</h1>
          <p className="text-slate-500">Welcome to your couple dashboard.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => onNavigate('search')} className="gap-2">
            <Users size={18} />
            Find Partner
          </Button>
          <Button onClick={() => onNavigate('savings')} className="gap-2 shadow-md shadow-indigo-100">
            <Wallet size={18} />
            Add Saving
          </Button>
        </div>
      </section>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-indigo-500/50 rounded-xl">
              <Wallet size={24} />
            </div>
            <span className="text-xs font-bold bg-indigo-500/50 px-2 py-1 rounded-lg">Balance</span>
          </div>
          <h3 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Total Shared Savings</h3>
          <p className="text-3xl font-extrabold">Rp {totalBalance.toLocaleString()}</p>
          <div className="mt-4 flex items-center gap-2 text-indigo-200 text-xs">
            <TrendingUp size={14} />
            <span>Updated just now</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <MessageSquare size={24} />
            </div>
            <span className="text-xs font-bold bg-slate-50 text-slate-500 px-2 py-1 rounded-lg">Status</span>
          </div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Active Chats</h3>
          <p className="text-3xl font-extrabold text-slate-900">{chats.length}</p>
          <div className="mt-4 flex items-center gap-2 text-slate-400 text-xs">
            <span>Keep the conversation going!</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <ImageIcon size={24} />
            </div>
            <span className="text-xs font-bold bg-slate-50 text-slate-500 px-2 py-1 rounded-lg">Archive</span>
          </div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Shared Memories</h3>
          <p className="text-3xl font-extrabold text-slate-900">{gallery.length}</p>
          <div className="mt-4 flex items-center gap-2 text-slate-400 text-xs">
            <span>Photos captured together</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900">Savings Growth</h3>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('savings')}>View Details</Button>
          </div>
          <SavingsChart savings={savings} />
        </div>

        {/* Recent Activity / Tasks */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">Recent Notifications</h3>
          <div className="space-y-4">
            {pendingSavingsCount > 0 && user.role === 'admin' ? (
              <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  <Wallet size={20} className="text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">New Pending Savings</p>
                  <p className="text-xs text-slate-500">{pendingSavingsCount} request(s) need approval</p>
                </div>
                <Button size="sm" onClick={() => onNavigate('admin')}>Review</Button>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-slate-400 text-sm">No new notifications</p>
              </div>
            )}

            {gallery.length > 0 && (
              <div className="p-1">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Recently Added Photos</h4>
                <div className="flex -space-x-2 overflow-hidden">
                  {gallery.slice(-5).map((photo, i) => (
                    <img 
                      key={photo.photoId} 
                      src={photo.imageUrl} 
                      className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover" 
                      alt="" 
                    />
                  ))}
                  {gallery.length > 5 && (
                    <div className="flex items-center justify-center h-10 w-10 rounded-full ring-2 ring-white bg-slate-100 text-[10px] font-bold text-slate-500">
                      +{gallery.length - 5}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
