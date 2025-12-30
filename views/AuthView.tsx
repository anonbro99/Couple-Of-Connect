
import React, { useState } from 'react';
import { User, Role } from '../types';
import { store } from '../services/storeService';
import { Button } from '../components/Button';
import { UserPlus, LogIn, Camera, AlertCircle, Heart, Lock, Mail, Loader2 } from 'lucide-react';

interface AuthViewProps {
  onLogin: (user: User) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [profilePic, setProfilePic] = useState('https://api.dicebear.com/7.x/avataaars/svg?seed=admin');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Simulasi pemrosesan digital (800ms)
    setTimeout(() => {
      const users = store.getUsers();
      
      // Kredensial Admin Khusus
      const isAdminEmail = loginIdentifier === 'couple@gmail.com';
      const isAdminPass = password === 'admin1927';

      if (isRegistering) {
        if (users.some(u => u.username === loginIdentifier || u.userId === `@${loginIdentifier}`)) {
          setError('ID atau Username sudah terdaftar.');
          setLoading(false);
          return;
        }
        
        const role: Role = (isAdminEmail && isAdminPass) ? 'admin' : 'user';
        
        const newUser: User = {
          uid: role === 'admin' ? 'admin-fixed-id' : Math.random().toString(36).substr(2, 9),
          username: loginIdentifier,
          userId: loginIdentifier.includes('@') ? loginIdentifier : `@${loginIdentifier}`,
          displayName: displayName || loginIdentifier,
          photoUrl: profilePic,
          role: role,
          createdAt: Date.now()
        };
        
        store.saveUser(newUser);
        store.setCurrentUser(newUser);
        onLogin(newUser);
      } else {
        // Logika Login
        if (isAdminEmail) {
          if (isAdminPass) {
            let adminUser = users.find(u => u.uid === 'admin-fixed-id');
            if (!adminUser) {
              adminUser = {
                uid: 'admin-fixed-id',
                username: 'couple@gmail.com',
                userId: '@admin_couple',
                displayName: 'Admin Master',
                photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
                role: 'admin',
                createdAt: Date.now()
              };
              store.saveUser(adminUser);
            }
            store.setCurrentUser(adminUser);
            onLogin(adminUser);
          } else {
            setError('Password Admin salah. Silakan coba lagi.');
          }
          setLoading(false);
          return;
        }

        const foundUser = users.find(u => u.username === loginIdentifier || u.userId === loginIdentifier || u.userId === `@${loginIdentifier}`);
        
        if (!foundUser) {
          setError('Akun tidak ditemukan. Periksa kembali ID Anda atau silakan Daftar.');
        } else {
          // Dalam simulasi ini, selain admin, password default adalah 'password123'
          // atau kita bebaskan untuk kemudahan prototype, namun kita beri validasi password
          if (password.length < 4) {
            setError('Password terlalu pendek (minimal 4 karakter).');
          } else {
            store.setCurrentUser(foundUser);
            onLogin(foundUser);
          }
        }
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-950">
      {/* Background Animated Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-600/10 blur-[120px] rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>

      <div className={`w-full max-w-md glass p-1 rounded-[40px] transition-all duration-500 shadow-[0_0_50px_rgba(0,0,0,0.5)] ${error ? 'shake border-rose-500/50' : 'border-white/10'}`}>
        <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[39px] px-8 pt-12 pb-10 border border-white/5">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 text-indigo-400 rounded-[28px] mb-6 neon-glow border border-indigo-500/30 animate-float">
              {isRegistering ? <UserPlus size={36} /> : <Heart size={36} className="text-rose-500 animate-pulse fill-rose-500/20" />}
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter mb-2">
              {isRegistering ? 'Join Digital' : 'Couple Space'}
            </h2>
            <p className="text-slate-400 text-sm font-medium">
              {isRegistering ? 'Daftar untuk membuat ruang privat baru' : 'Masuk untuk terhubung dengan pasangan'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-xs font-bold animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={16} />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {isRegistering && (
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse"></div>
                  <img src={profilePic} alt="Profile" className="relative w-24 h-24 rounded-[30px] object-cover border border-white/20 shadow-2xl" />
                  <button 
                    type="button" 
                    onClick={() => setProfilePic(`https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`)}
                    className="absolute -bottom-1 -right-1 p-2.5 bg-indigo-600 text-white rounded-2xl shadow-xl hover:bg-indigo-500 transition-all hover:scale-110 active:scale-95 border border-white/10"
                  >
                    <Camera size={16} />
                  </button>
                </div>
              </div>
            )}

            <div className="group space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">ID / Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  required
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 focus:outline-none transition-all duration-300"
                  placeholder="ID Akun"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                />
              </div>
            </div>

            {isRegistering && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Nama Panggilan</label>
                <input 
                  required
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 focus:outline-none transition-all duration-300"
                  placeholder="Contoh: Sayang"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
            )}

            <div className="group space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center text-slate-500 group-focus-within:text-rose-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  required
                  type="password"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 focus:outline-none transition-all duration-300"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              fullWidth 
              size="lg" 
              className="mt-6 h-16 text-lg shadow-[0_10px_30px_rgba(79,70,229,0.3)] relative overflow-hidden group"
              disabled={loading}
            >
              <span className={`flex items-center gap-2 transition-all duration-300 ${loading ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
                {isRegistering ? 'Buat Ruang Sekarang' : 'Masuk Portal'}
                <LogIn size={20} />
              </span>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                </div>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 pt-6">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                {isRegistering ? 'Sudah terdaftar?' : 'Belum punya akses?'}
              </span>
              <button 
                type="button"
                className="text-xs font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError(null);
                }}
              >
                {isRegistering ? 'Login' : 'Daftar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
