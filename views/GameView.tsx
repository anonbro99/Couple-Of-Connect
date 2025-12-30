
import React, { useState, useEffect, useRef } from 'react';
import { User, GameSession, Chat } from '../types';
import { store } from '../services/storeService';
import { Button } from '../components/Button';
import { CameraCapture } from '../components/CameraCapture';
import { VideoRecorder } from '../components/VideoRecorder';
import { 
  Gamepad2, 
  Heart, 
  Flame, 
  Sparkles, 
  RefreshCw, 
  ArrowRight, 
  Camera, 
  Video as VideoIcon,
  X, 
  MessageSquare,
  LogOut,
  ChevronRight,
  Play
} from 'lucide-react';

const TRUTHS = [
  "Apa kesan pertama kamu saat melihatku?",
  "Apa sifatku yang paling kamu sukai?",
  "Kapan terakhir kali kamu merasa sangat bangga denganku?",
  "Apa hal yang ingin kamu lakukan bersamaku tapi belum tercapai?",
  "Apa ketakutan terbesarmu dalam hubungan ini?",
  "Siapa yang paling sering mengalah saat kita bertengkar?",
  "Hal kecil apa yang aku lakukan yang membuatmu merasa dicintai?"
];

const DARES = [
  "Cium pipiku selama 10 detik sekarang juga!",
  "Kirimkan pesan 'Aku sayang kamu' ke aku lewat chat sekarang.",
  "Nyanyikan sepenggal lagu romantis untukku!",
  "Posting foto kita di story (jika berani)!",
  "Pijat bahuku selama 2 menit.",
  "Tatap mataku selama 1 menit tanpa tertawa.",
  "Ceritakan satu rahasia lucumu yang belum pernah aku tahu."
];

export const GameView: React.FC<{ user: User }> = ({ user }) => {
  const [session, setSession] = useState<GameSession | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [partner, setPartner] = useState<User | null>(null);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [answerImage, setAnswerImage] = useState<string | null>(null);
  const [answerVideo, setAnswerVideo] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  
  const activityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initGame = async () => {
      const chats = await store.getChats(user.uid);
      const chat = chats[0]; // For simplicity, take the first chat
      if (chat) {
        setActiveChat(chat);
        const users = await store.getUsers();
        const partnerId = chat.members.find(id => id !== user.uid);
        const partnerUser = users.find(u => u.uid === partnerId);
        if (partnerUser) setPartner(partnerUser);

        const existingSession = await store.getGameSession(chat.chatId);
        if (!existingSession) {
          const newSession: GameSession = {
            chatId: chat.chatId,
            turnUid: user.uid,
            currentChallenge: null,
            challengeType: null,
            lastAnswerText: null,
            lastAnswerImage: null,
            lastAnswerVideo: null,
            lastUpdated: Date.now()
          };
          await store.updateGameSession(newSession);
          setSession(newSession);
        } else {
          setSession(existingSession);
        }
      }
    };
    initGame();
  }, [user.uid]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (activeChat) {
        const s = await store.getGameSession(activeChat.chatId);
        if (s && s.lastUpdated !== session?.lastUpdated) {
          setSession(s);
          activityRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [session, activeChat]);

  const generateChallenge = (selectedType: 'truth' | 'dare') => {
    if (!session || session.turnUid !== user.uid) return;
    setIsSpinning(true);
    
    setTimeout(async () => {
      const list = selectedType === 'truth' ? TRUTHS : DARES;
      const random = list[Math.floor(Math.random() * list.length)];
      
      const updatedSession: GameSession = {
        ...session,
        currentChallenge: random,
        challengeType: selectedType,
        lastAnswerText: null,
        lastAnswerImage: null,
        lastAnswerVideo: null,
        lastUpdated: Date.now()
      };
      
      await store.updateGameSession(updatedSession);
      setSession(updatedSession);
      setIsSpinning(false);
    }, 1500);
  };

  const submitAnswer = async () => {
    if (!session || !partner) return;
    
    const updatedSession: GameSession = {
      ...session,
      turnUid: partner.uid,
      lastAnswerText: answerText,
      lastAnswerImage: answerImage,
      lastAnswerVideo: answerVideo,
      lastUpdated: Date.now()
    };
    
    await store.updateGameSession(updatedSession);
    setSession(updatedSession);
    setAnswerText('');
    setAnswerImage(null);
    setAnswerVideo(null);
  };

  const terminateSession = async () => {
    if (activeChat && confirm('Akhiri sesi permainan ini?')) {
      await store.updateGameSession(null, activeChat.chatId);
      window.location.reload();
    }
  };

  if (!activeChat || !partner) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-slate-700 animate-pulse">
          <Gamepad2 size={48} />
        </div>
        <h2 className="text-xl font-black text-white uppercase tracking-widest">Neural Link Required</h2>
        <p className="text-slate-500 max-w-xs text-xs font-bold uppercase tracking-widest">Hubungkan diri dengan pasangan via chat terlebih dahulu untuk bermain.</p>
      </div>
    );
  }

  const isMyTurn = session?.turnUid === user.uid;

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Header Info */}
      <div className="flex items-center justify-between glass p-6 rounded-[32px] border-white/5">
        <div className="flex items-center gap-6">
          <div className={`relative p-1 rounded-2xl border-2 transition-all ${isMyTurn ? 'border-indigo-500 neon-border' : 'border-transparent opacity-40 grayscale'}`}>
            <img src={user.photoUrl} className="w-12 h-12 rounded-xl object-cover" alt="" />
          </div>
          <div className="flex flex-col items-center gap-1">
             <div className="w-16 h-0.5 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-full"></div>
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sync</span>
          </div>
          <div className={`relative p-1 rounded-2xl border-2 transition-all ${!isMyTurn ? 'border-rose-500 neon-border' : 'border-transparent opacity-40 grayscale'}`}>
            <img src={partner.photoUrl} className="w-12 h-12 rounded-xl object-cover" alt="" />
          </div>
        </div>
        
        <button 
          onClick={terminateSession}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
        >
          <LogOut size={16} />
          End Session
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Game Controller Area */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="glass flex-1 rounded-[40px] p-8 border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full"></div>
            
            <div className="relative z-10 w-full flex flex-col items-center">
              <div className={`mb-8 px-5 py-2 rounded-full border text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 ${
                isMyTurn ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-slate-900 text-slate-500 border-white/5'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isMyTurn ? 'bg-indigo-500 animate-ping' : 'bg-slate-700'}`}></div>
                {isMyTurn ? 'Gilirannmu Memilih' : `Menunggu ${partner.displayName}...`}
              </div>

              {isSpinning ? (
                <div className="py-20 flex flex-col items-center gap-6 animate-pulse">
                  <RefreshCw size={64} className="text-indigo-400 animate-spin" />
                  <p className="text-sm font-black text-indigo-400 uppercase tracking-[0.4em]">Searching Fate...</p>
                </div>
              ) : session?.currentChallenge ? (
                <div className="w-full text-center space-y-8 animate-in zoom-in-95">
                  <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] ${
                    session.challengeType === 'truth' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {session.challengeType === 'truth' ? <Sparkles size={14} /> : <Flame size={14} />}
                    Neural Mode: {session.challengeType}
                  </div>
                  
                  <div className="bg-white/5 border border-white/5 rounded-[32px] p-10 shadow-inner">
                    <p className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                      "{session.currentChallenge}"
                    </p>
                  </div>

                  {isMyTurn && (
                    <div className="space-y-6 w-full max-w-md mx-auto">
                      <div className="relative group">
                        <textarea 
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          placeholder="Ketik jawabanmu di sini..."
                          className="w-full bg-slate-950 border border-white/10 rounded-[24px] p-6 text-white text-sm focus:border-indigo-500 focus:outline-none transition-all h-24 resize-none"
                        />
                        <div className="absolute bottom-4 right-4 flex gap-2">
                          <button 
                            onClick={() => setShowCamera(true)}
                            className={`p-3 rounded-xl transition-all ${answerImage ? 'bg-emerald-500 text-white shadow-lg' : 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white'}`}
                          >
                            <Camera size={20} />
                          </button>
                          <button 
                            onClick={() => setShowVideoRecorder(true)}
                            className={`p-3 rounded-xl transition-all ${answerVideo ? 'bg-amber-500 text-white shadow-lg' : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white'}`}
                          >
                            <VideoIcon size={20} />
                          </button>
                        </div>
                      </div>

                      {(answerImage || answerVideo) && (
                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 group shadow-2xl">
                          {answerImage ? (
                            <img src={answerImage} className="w-full h-full object-cover" alt="Answer Preview" />
                          ) : (
                            <video src={answerVideo || ''} className="w-full h-full object-cover" autoPlay muted loop />
                          )}
                          <button 
                            onClick={() => { setAnswerImage(null); setAnswerVideo(null); }} 
                            className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}

                      <Button 
                        size="lg" 
                        fullWidth
                        disabled={!answerText.trim() && !answerImage && !answerVideo}
                        onClick={submitAnswer}
                        className="h-16 rounded-[24px] uppercase tracking-widest font-black text-xs shadow-2xl bg-indigo-600"
                      >
                        Kirim Jawaban & Selesai
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-8 w-full">
                  <h3 className="text-xl font-black text-white tracking-tight uppercase text-center">
                    {isMyTurn ? 'Inisialisasi Neural Challenge' : 'Menunggu Input Partner'}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      disabled={!isMyTurn}
                      onClick={() => generateChallenge('truth')}
                      className={`p-10 glass rounded-[32px] transition-all flex flex-col items-center gap-4 border-2 ${
                        isMyTurn ? 'border-indigo-500/30 hover:bg-indigo-500/10 cursor-pointer' : 'border-white/5 opacity-40 grayscale'
                      }`}
                    >
                      <Sparkles size={32} className="text-indigo-400" />
                      <span className="font-black uppercase tracking-widest text-[10px] text-indigo-400">TRUTH</span>
                    </button>

                    <button 
                      disabled={!isMyTurn}
                      onClick={() => generateChallenge('dare')}
                      className={`p-10 glass rounded-[32px] transition-all flex flex-col items-center gap-4 border-2 ${
                        isMyTurn ? 'border-rose-500/30 hover:bg-rose-500/10 cursor-pointer' : 'border-white/5 opacity-40 grayscale'
                      }`}
                    >
                      <Flame size={32} className="text-rose-400" />
                      <span className="font-black uppercase tracking-widest text-[10px] text-rose-400">DARE</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Neural Log Area */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="glass rounded-[32px] flex-1 flex flex-col border-white/5 overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <MessageSquare size={18} className="text-indigo-400" />
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Neural Activity Log</h3>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {session?.lastAnswerText || session?.lastAnswerImage || session?.lastAnswerVideo ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center gap-3">
                     <img src={session.turnUid === user.uid ? partner.photoUrl : user.photoUrl} className="w-8 h-8 rounded-lg object-cover" alt="" />
                     <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        {session.turnUid === user.uid ? partner.displayName : 'Kamu'} baru saja menjawab
                     </p>
                  </div>
                  
                  <div className="glass p-5 rounded-[24px] border-white/10 bg-indigo-500/5">
                    {session.lastAnswerVideo ? (
                      <div className="rounded-xl overflow-hidden mb-4 border border-white/10 relative group">
                         <video 
                          src={session.lastAnswerVideo} 
                          className="w-full h-auto" 
                          controls 
                          playsInline
                        />
                         <div className="absolute top-4 right-4 p-2 bg-indigo-600 rounded-lg shadow-lg">
                           <VideoIcon size={14} className="text-white" />
                         </div>
                      </div>
                    ) : session.lastAnswerImage ? (
                      <div className="rounded-xl overflow-hidden mb-4 border border-white/10">
                         <img src={session.lastAnswerImage} className="w-full h-auto" alt="Answer" />
                      </div>
                    ) : null}
                    
                    {session.lastAnswerText && (
                      <p className="text-sm font-medium text-white leading-relaxed italic">
                        "{session.lastAnswerText}"
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center px-10">
                  <Heart size={40} className="mb-4 text-indigo-400" />
                  <p className="text-[9px] font-black uppercase tracking-[0.2em]">Selesaikan tantangan untuk melihat hasilnya di sini.</p>
                </div>
              )}
              <div ref={activityRef} />
            </div>
            
            <div className="p-4 bg-slate-950/40 border-t border-white/5">
               <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
                  <Sparkles size={14} className="text-indigo-400" />
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] flex-1">Permainan Berlangsung...</p>
                  <ChevronRight size={14} className="text-slate-700" />
               </div>
            </div>
          </div>
        </div>
      </div>

      {showCamera && (
        <CameraCapture onCapture={(img) => { setAnswerImage(img); setShowCamera(false); }} onClose={() => setShowCamera(false)} />
      )}

      {showVideoRecorder && (
        <VideoRecorder onCapture={(vid) => { setAnswerVideo(vid); setShowVideoRecorder(false); }} onClose={() => setShowVideoRecorder(false)} />
      )}
    </div>
  );
};
