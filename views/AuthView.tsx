
import React, { useState } from 'react';
import { User, Role } from '../types';
import { supabase } from '../services/supabaseClient';
import { store } from '../services/storeService';
import { Button } from '../components/Button';
import { UserPlus, LogIn, Camera, AlertCircle, Heart, Lock, Mail, Loader2 } from 'lucide-react';

interface AuthViewProps {
  onLogin: (user: User) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [profilePic, setProfilePic] = useState('https://api.dicebear.com/7.x/avataaars/svg?seed=admin');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;
        if (authData.user) {
          const { error: profileError } = await supabase.from('profiles').insert({
            id: authData.user.id,
            username: email,
            user_id: `@${username || email.split('@')[0]}`,
            display_name: displayName || email.split('@')[0],
            photo_url: profilePic,
            role: email === 'couple@gmail.com' ? 'admin' : 'user'
          });
          
          if (profileError) throw profileError;
          
          const profile = await store.getCurrentProfile(authData.user.id);
          if (profile) onLogin(profile);
        }
      } else {
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        if (authData.user) {
          const profile = await store.getCurrentProfile(authData.user.id);
          if (profile) onLogin(profile);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan otentikasi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-950">
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
            <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">
              {isRegistering ? 'Daftar Ruang Privat' : 'Masuk Portal'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-[10px] font-bold">
              <AlertCircle size={16} />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="group space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  required
                  type="email"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none transition-all"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {isRegistering && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Username (@ID)</label>
                  <input 
                    required
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none transition-all"
                    placeholder="username_saya"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Display Name</label>
                  <input 
                    required
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none transition-all"
                    placeholder="Nama Panggilan"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="group space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Security Key</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center text-slate-500 group-focus-within:text-rose-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  required
                  type="password"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none transition-all"
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
              className="mt-6 h-16 text-xs uppercase tracking-[0.2em] shadow-xl relative overflow-hidden"
              disabled={loading}
            >
              <span className={loading ? 'opacity-0' : 'opacity-100 flex items-center gap-2'}>
                {isRegistering ? 'Register Access' : 'Establish Link'}
                <LogIn size={20} />
              </span>
              {loading && <Loader2 className="absolute w-6 h-6 animate-spin" />}
            </Button>

            <button 
              type="button"
              className="w-full text-center text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mt-4 hover:text-indigo-300"
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering ? 'Already have a link? Login' : 'Need a new link? Register'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
