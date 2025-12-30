
import React, { useState, useEffect } from 'react';
import { User, Saving, GalleryPhoto, SavingStatus } from '../types';
import { store } from '../services/storeService';
import { Button } from '../components/Button';
import { 
  ShieldCheck, 
  Check, 
  X, 
  Trash2, 
  Users, 
  Wallet, 
  Image as ImageIcon,
  AlertTriangle 
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const [savings, setSavings] = useState<Saving[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [gallery, setGallery] = useState<GalleryPhoto[]>([]);
  const [activeTab, setActiveTab] = useState<'savings' | 'users' | 'gallery'>('savings');

  const fetchAllData = async () => {
    const [s, u, g] = await Promise.all([
      store.getSavings(),
      store.getUsers(),
      store.getGallery()
    ]);
    setSavings(s);
    setUsers(u);
    setGallery(g);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleApprove = async (id: string) => {
    await store.updateSavingStatus(id, 'accepted');
    const s = await store.getSavings();
    setSavings(s);
  };

  const handleReject = async (id: string) => {
    await store.updateSavingStatus(id, 'rejected');
    const s = await store.getSavings();
    setSavings(s);
  };

  const handleDeleteSaving = async (id: string) => {
    if (confirm('Delete this record?')) {
      await store.deleteSaving(id);
      const s = await store.getSavings();
      setSavings(s);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (confirm('Delete this user account and all related data?')) {
      await store.deleteUser(uid);
      const u = await store.getUsers();
      setUsers(u);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (confirm('Remove this photo from gallery?')) {
      await store.deletePhoto(id);
      const g = await store.getGallery();
      setGallery(g);
    }
  };

  const handleClearGallery = async () => {
    if (confirm('CRITICAL: Clear the ENTIRE shared gallery? This cannot be undone.')) {
      await store.clearAllPhotos();
      setGallery([]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-xl">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Control Panel</h1>
            <p className="text-slate-500 text-sm">Full authority over couple data and moderation.</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-fit">
        <button 
          onClick={() => setActiveTab('savings')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'savings' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <div className="flex items-center gap-2">
            <Wallet size={16} />
            Savings
          </div>
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
           <div className="flex items-center gap-2">
            <Users size={16} />
            Users
          </div>
        </button>
        <button 
          onClick={() => setActiveTab('gallery')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'gallery' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
           <div className="flex items-center gap-2">
            <ImageIcon size={16} />
            Gallery
          </div>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {activeTab === 'savings' && (
          <div className="divide-y divide-slate-100">
            {savings.length === 0 && <div className="p-20 text-center text-slate-400">No savings records found.</div>}
            {savings.sort((a,b) => b.createdAt - a.createdAt).map(saving => (
              <div key={saving.savingId} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold">
                    {saving.userName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Rp {saving.amount.toLocaleString()} • <span className="text-indigo-600">{saving.paymentMethod}</span></p>
                    <p className="text-xs text-slate-500">by {saving.userName} • {new Date(saving.createdAt).toLocaleString()}</p>
                    <div className="mt-1">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${
                        saving.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 
                        saving.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {saving.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end md:self-center">
                  {saving.status === 'pending' && (
                    <>
                      <Button size="sm" variant="success" className="gap-1" onClick={() => handleApprove(saving.savingId)}>
                        <Check size={14} /> Approve
                      </Button>
                      <Button size="sm" variant="danger" className="gap-1" onClick={() => handleReject(saving.savingId)}>
                        <X size={14} /> Reject
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="ghost" className="text-rose-500 hover:bg-rose-50" onClick={() => handleDeleteSaving(saving.savingId)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="divide-y divide-slate-100">
             {users.map(u => (
               <div key={u.uid} className="p-6 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                   <img src={u.photoUrl} className="w-12 h-12 rounded-full object-cover" alt="" />
                   <div>
                     <p className="font-bold text-slate-900">{u.displayName}</p>
                     <p className="text-xs text-slate-500">{u.userId} • Role: <span className="font-bold uppercase text-indigo-600">{u.role}</span></p>
                   </div>
                 </div>
                 <Button variant="ghost" className="text-rose-500 hover:bg-rose-50" onClick={() => handleDeleteUser(u.uid)}>
                   <Trash2 size={18} />
                 </Button>
               </div>
             ))}
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
               <h3 className="font-bold text-slate-900">Global Gallery Management</h3>
               <Button variant="danger" size="sm" className="gap-2" onClick={handleClearGallery}>
                 <AlertTriangle size={16} />
                 Clear All Photos
               </Button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {gallery.map(photo => (
                <div key={photo.photoId} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img src={photo.imageUrl} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleDeletePhoto(photo.photoId)} className="p-2 bg-rose-500 text-white rounded-lg shadow-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
