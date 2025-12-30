
import React, { useRef, useState, useCallback } from 'react';
import { Button } from './Button';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onCapture(dataUrl);
        stopCamera();
        onClose();
      }
    }
  };

  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
      <div className="relative w-full max-w-lg aspect-video bg-slate-900 rounded-lg overflow-hidden">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-4 bg-black/60 text-white text-center">
            {error}
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-4">
        <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => { stopCamera(); onClose(); }}>
          Cancel
        </Button>
        <Button size="lg" className="rounded-full w-16 h-16" onClick={capturePhoto}>
          <div className="w-10 h-10 border-4 border-white rounded-full" />
        </Button>
      </div>
    </div>
  );
};
