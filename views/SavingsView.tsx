
import React, { useState, useEffect } from 'react';
import { User, Saving, PaymentMethod } from '../types';
import { store } from '../services/storeService';
import { Button } from '../components/Button';
import { SavingsChart } from '../components/SavingsChart';
import { CameraCapture } from '../components/CameraCapture';
import { Wallet, Plus, CreditCard, Landmark, CheckCircle, Clock, XCircle, Trash2, Camera, X, Upload, Coins } from 'lucide-react';

interface SavingsViewProps {
  currentUser: User;
}

export const SavingsView: React.FC<SavingsViewProps> = ({ currentUser }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('QRIS');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [allSavings, setAllSavings] = useState<Saving[]>([]);

  const fetchSavings = async () => {
    const data = await store.getSavings();
    setAllSavings(data);
  };

  useEffect(() => {
    fetchSavings();
  }, []);
  
  const acceptedBalance = allSavings.filter(s => s.status === 'accepted').reduce((sum, s) => sum + s.amount, 0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || !proofImage) {
      alert('Mohon masukkan nominal dan bukti pembayaran.');
      return;
    };

    const newSaving: Partial<Saving> = {
      userId: currentUser.uid,
      userName: currentUser.displayName,
      amount: Number(amount),
      paymentMethod: method,
      proofImage: proofImage,
    };

    await store.addSaving(newSaving);
    setShowAddForm(false);
    setAmount('');
    setProofImage(null);
    fetchSavings();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus catatan tabungan ini?')) {
      await store.deleteSaving(id);
      fetchSavings();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase neon-text">Digital Vault</h1>
          <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">Membangun masa depan blok demi blok</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} size="lg" className="gap-3 h-16 px-8 rounded-[24px] shadow-xl shadow-indigo-500/20 group">
          <div className="p-1.5 bg-white/20 rounded-lg group-hover:rotate-90 transition-transform duration-500">
            <Plus size={20} strokeWidth={3} />
          </div>
          <span className="font-black uppercase tracking-widest text-xs">Setor Saldo</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Balance Card */}
          <div className="glass rounded-[48px] p-12 relative overflow-hidden border-white/5 shadow-2xl group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full group-hover:bg-indigo-600/20 transition-all duration-1000"></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <Coins size={14} /> Total Verified
                </div>
                <h2 className="text-6xl font-black text-white tracking-tighter">
                  <span className="text-indigo-500 text-3xl mr-2">Rp</span>
                  {acceptedBalance.toLocaleString('id-ID')}
                </h2>
                <div className="flex items-center gap-3 text-slate-500">
                  <CheckCircle size={16} className="text-emerald-500" />
                  <span className="text-xs font-bold uppercase tracking-widest">Semua transaksi terenkripsi</span>
                </div>
              </div>
              <div className="flex-1 max-w-[320px] bg-slate-950/40 p-6 rounded-[32px] border border-white/5 backdrop-blur-md">
                <SavingsChart savings={allSavings} />
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="glass rounded-[48px] border-white/5 overflow-hidden shadow-xl">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
              <h3 className="font-black text-white uppercase tracking-[0.2em] text-xs">Neural Ledger</h3>
              <div className="px-4 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                {allSavings.length} Data Transaksi
              </div>
            </div>
            <div className="divide-y divide-white/5 bg-slate-900/20">
              {allSavings.sort((a,b) => b.createdAt - a.createdAt).map(saving => (
                <div key={saving.savingId} className="p-8 flex items-center justify-between hover:bg-white/5 transition-all group">
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 border ${
                      saving.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      saving.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {saving.paymentMethod === 'QRIS' ? <CreditCard size={28} /> : <Landmark size={28} />}
                    </div>
                    <div>
                      <p className="font-black text-white text-2xl tracking-tighter">Rp {saving.amount.toLocaleString('id-ID')}</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">SENDER: {saving.userName} • {new Date(saving.createdAt).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className={`flex items-center gap-2 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border ${
                      saving.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 
                      saving.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {saving.status}
                    </div>
                    {currentUser.role === 'admin' && (
                      <button onClick={() => handleDelete(saving.savingId)} className="p-3 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all">
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {allSavings.length === 0 && (
                <div className="py-32 text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-slate-700">
                    <Wallet size={40} />
                  </div>
                  <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Ledger Kosong.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Methods Info */}
        <div className="space-y-8">
          <div className="glass rounded-[48px] p-10 border-white/5 bg-indigo-600/5 shadow-2xl">
            <h3 className="text-xl font-black text-white mb-8 tracking-tighter uppercase">Gateway Info</h3>
            <div className="space-y-5">
              <div className="flex items-center gap-5 p-6 bg-slate-900/60 rounded-[32px] border border-white/5 group hover:border-indigo-500/30 transition-all duration-500">
                <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 group-hover:rotate-6 transition-transform">
                  <CreditCard size={28} />
                </div>
                <div>
                  <p className="text-sm font-black text-white uppercase tracking-wider">Digital QRIS</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">E-Wallet Ready</p>
                </div>
              </div>
              <div className="flex items-center gap-5 p-6 bg-slate-900/60 rounded-[32px] border border-white/5 group hover:border-indigo-500/30 transition-all duration-500">
                <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-rose-500/20 group-hover:-rotate-6 transition-transform">
                  <Landmark size={28} />
                </div>
                <div>
                  <p className="text-sm font-black text-white uppercase tracking-wider">DANA Transfer</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">08XX-XXXX-XXXX</p>
                </div>
              </div>
            </div>
            <div className="mt-10 p-5 bg-white/5 rounded-2xl border border-white/5">
               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-relaxed italic text-center">"Setiap koin yang kau simpan adalah langkah menuju masa depan bersama kita."</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Form Modal - SOLID UI */}
      {showAddForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="glass w-full max-w-lg rounded-[48px] shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden border-indigo-500/20 animate-in zoom-in-95 duration-500">
            <div className="bg-slate-900/80 p-10">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Setor Digital</h2>
                  <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em] mt-1">Inisialisasi Transaksi Baru</p>
                </div>
                <button onClick={() => setShowAddForm(false)} className="p-4 bg-white/5 text-slate-500 hover:text-white rounded-2xl transition-all border border-white/5">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* NOMINAL INPUT - SOLID & CLEAR */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Nominal Deposit (Rp)</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-6 flex items-center text-indigo-500 font-black text-2xl">Rp</div>
                    <input 
                      required
                      type="number"
                      placeholder="0.00"
                      className="w-full pl-20 pr-8 py-8 bg-slate-950 border-2 border-indigo-500/30 rounded-[32px] text-white font-black text-4xl placeholder:text-slate-800 focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 focus:outline-none transition-all shadow-inner"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Metode Jalur</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setMethod('QRIS')}
                      className={`flex flex-col items-center gap-3 p-8 rounded-[32px] border-2 transition-all duration-500 ${
                        method === 'QRIS' ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-white/5 bg-white/5 text-slate-500 hover:border-white/10'
                      }`}
                    >
                      <CreditCard size={32} />
                      <span className="text-[10px] font-black uppercase tracking-widest">QRIS GATEWAY</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setMethod('DANA')}
                      className={`flex flex-col items-center gap-3 p-8 rounded-[32px] border-2 transition-all duration-500 ${
                        method === 'DANA' ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-white/5 bg-white/5 text-slate-500 hover:border-white/10'
                      }`}
                    >
                      <Landmark size={32} />
                      <span className="text-[10px] font-black uppercase tracking-widest">DANA DIRECT</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Verifikasi Visual</label>
                  {proofImage ? (
                    <div className="relative aspect-video rounded-[32px] overflow-hidden border-2 border-indigo-500/30 group shadow-2xl">
                      <img src={proofImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Proof" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <button 
                          type="button"
                          onClick={() => setProofImage(null)}
                          className="p-4 bg-rose-600 text-white rounded-2xl shadow-xl hover:scale-110 transition-all font-black uppercase tracking-widest text-[10px]"
                        >
                          Ganti Bukti
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        type="button"
                        onClick={() => setShowCamera(true)}
                        className="flex flex-col items-center justify-center gap-3 p-10 border-2 border-dashed border-white/10 bg-white/5 rounded-[32px] text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 transition-all group"
                      >
                        <Camera size={36} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Ambil Foto</span>
                      </button>
                      <label className="flex flex-col items-center justify-center gap-3 p-10 border-2 border-dashed border-white/10 bg-white/5 rounded-[32px] text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 cursor-pointer transition-all group">
                        <Upload size={36} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Unggah Galeri</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                      </label>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-6">
                  <Button variant="ghost" fullWidth type="button" onClick={() => setShowAddForm(false)} className="h-16 text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] border border-white/5">Abors Transaksi</Button>
                  <Button fullWidth type="submit" className="h-16 text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/40">Konfirmasi Setoran</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showCamera && (
        <CameraCapture onCapture={(img) => { setProofImage(img); setShowCamera(false); }} onClose={() => setShowCamera(false)} />
      )}
    </div>
  );
};
