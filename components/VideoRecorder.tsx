
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from './Button';
import { X, Circle, StopCircle, RefreshCw } from 'lucide-react';

interface VideoRecorderProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

export const VideoRecorder: React.FC<VideoRecorderProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [timeLeft, setTimeLeft] = useState(10);
  const [error, setError] = useState<string>('');

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: true 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Akses kamera/mikrofon ditolak.');
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startRecording = () => {
    if (!stream) return;
    setRecordedChunks([]);
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorderRef.current = mediaRecorder;
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        setRecordedChunks(prev => [...prev, e.data]);
      }
    };

    mediaRecorder.onstop = async () => {
      // Data will be processed in the useEffect monitoring recordedChunks
    };

    mediaRecorder.start();
    setRecording(true);
    setTimeLeft(10);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  useEffect(() => {
    let timer: number;
    if (recording && timeLeft > 0) {
      timer = window.setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && recording) {
      stopRecording();
    }
    return () => clearInterval(timer);
  }, [recording, timeLeft]);

  useEffect(() => {
    if (!recording && recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const reader = new FileReader();
      reader.onloadend = () => {
        onCapture(reader.result as string);
        stopCamera();
        onClose();
      };
      reader.readAsDataURL(blob);
    }
  }, [recordedChunks, recording]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="fixed inset-0 z-[110] bg-slate-950 flex flex-col items-center justify-center p-6 backdrop-blur-3xl">
      <div className="relative w-full max-w-xl aspect-[3/4] bg-slate-900 rounded-[40px] overflow-hidden border-4 border-white/5 shadow-2xl">
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline 
          className="w-full h-full object-cover grayscale-[0.3]"
        />
        
        {/* Recording Status Overlay */}
        {recording && (
          <div className="absolute top-8 left-8 flex items-center gap-3 px-4 py-2 bg-rose-600 rounded-full animate-pulse shadow-lg">
            <div className="w-3 h-3 bg-white rounded-full"></div>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Recording {timeLeft}s</span>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-10 bg-black/80 text-white text-center font-bold">
            {error}
          </div>
        )}
      </div>

      <div className="mt-12 flex items-center gap-8">
        <button 
          onClick={() => { stopCamera(); onClose(); }}
          className="p-5 bg-white/5 text-slate-400 hover:text-white rounded-3xl transition-all border border-white/5"
        >
          <X size={24} />
        </button>
        
        {!recording ? (
          <button 
            onClick={startRecording}
            className="w-20 h-20 bg-rose-600 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(225,29,72,0.4)] hover:scale-110 active:scale-95 transition-all group"
          >
            <Circle size={32} className="fill-white group-hover:scale-90 transition-transform" />
          </button>
        ) : (
          <button 
            onClick={stopRecording}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-rose-600 shadow-[0_0_30px_rgba(255,255,255,0.4)] animate-pulse"
          >
            <StopCircle size={32} fill="currentColor" />
          </button>
        )}

        <div className="w-14"></div> {/* Spacer for symmetry */}
      </div>
      
      <p className="mt-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Max duration: 10 seconds</p>
    </div>
  );
};
