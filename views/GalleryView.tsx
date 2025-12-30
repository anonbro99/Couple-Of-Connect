
import React, { useState, useEffect } from 'react';
import { User, GalleryPhoto } from '../types';
import { store } from '../services/storeService';
import { Button } from '../components/Button';
import { CameraCapture } from '../components/CameraCapture';
import { Camera, Image as ImageIcon, Trash2, Maximize2, X, Plus, Upload } from 'lucide-react';

interface GalleryViewProps {
  currentUser: User;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ currentUser }) => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchGallery = async () => {
    const data = await store.getGallery();
    setPhotos(data);
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleCapture = (base64: string) => {
    setSelectedImage(base64);
    setShowUpload(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) return;

    const newPhoto: Partial<GalleryPhoto> = {
      imageUrl: selectedImage,
      title: title || 'Kenangan Indah',
      caption: caption || 'Momen bersama pasangan.',
      uploadedBy: currentUser.uid,
      uploaderName: currentUser.displayName,
      isPublic: true,
    };

    await store.addPhoto(newPhoto);
    setShowUpload(false);
    setSelectedImage(null);
    setTitle('');
    setCaption('');
    fetchGallery();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Hapus kenangan ini selamanya?')) {
      await store.deletePhoto(id);
      fetchGallery();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter">Galeri Bersama</h1>
          <p className="text-slate-400 font-medium italic">Simpan setiap detak jantung dalam bingkai digital.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => setShowCamera(true)} className="gap-2 h-14 px-6 border-white/10 bg-white/5 hover:bg-white/10 text-white">
            <Camera size={20} />
            <span className="hidden sm:inline uppercase tracking-widest font-black text-[10px]">Ambil Foto</span>
          </Button>
          <Button onClick={() => setShowUpload(true)} className="gap-2 h-14 px-6 shadow-xl shadow-indigo-500/20">
            <Plus size={20} />
            <span className="hidden sm:inline uppercase tracking-widest font-black text-[10px]">Unggah</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {photos.sort((a,b) => b.createdAt - a.createdAt).map(photo => (
          <div 
            key={photo.photoId}
            onClick={() => setSelectedPhoto(photo)}
            className="group relative aspect-square glass rounded-[32px] overflow-hidden shadow-2xl cursor-pointer hover:shadow-indigo-500/20 transition-all duration-500 hover:-translate-y-2 border-white/5"
          >
            <img 
              src={photo.imageUrl} 
              alt={photo.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
              <p className="text-white font-black text-sm tracking-tight mb-1">{photo.title}</p>
              <p className="text-indigo-400 text-[9px] font-black uppercase tracking-[0.2em]">{photo.uploaderName}</p>
            </div>
            
            {(photo.uploadedBy === currentUser.uid || currentUser.role === 'admin') && (
              <button 
                onClick={(e) => handleDelete(photo.photoId, e)}
                className="absolute top-4 right-4 p-2.5 bg-rose-500/20 backdrop-blur-md text-rose-400 rounded-2xl opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white transition-all shadow-xl"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}

        {photos.length === 0 && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center text-slate-500 glass rounded-[48px] border-2 border-dashed border-white/10">
            <div className="w-20 h-20 bg-white/5 rounded-[32px] flex items-center justify-center mb-6 text-slate-700 animate-pulse">
              <ImageIcon size={48} strokeWidth={1} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.3em]">Belum ada foto.</p>
            <Button variant="ghost" className="mt-8 text-indigo-400 hover:bg-indigo-500/10 font-black uppercase tracking-widest text-[10px]" onClick={() => setShowUpload(true)}>Mulai Abadikan Momen</Button>
          </div>
        )}
      </div>

      {showCamera && (
        <CameraCapture onCapture={handleCapture} onClose={() => setShowCamera(false)} />
      )}

      {/* Upload/Creation Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="glass w-full max-w-lg rounded-[48px] shadow-3xl overflow-hidden border-white/10 animate-in zoom-in-95 duration-300">
            <div className="bg-slate-900/60 p-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tighter">Simpan Kenangan</h2>
                  <p className="text-sm text-slate-500 font-medium">Abadikan detik ini selamanya.</p>
                </div>
                <button onClick={() => { setShowUpload(false); setSelectedImage(null); }} className="p-3 bg-white/5 text-slate-400 hover:text-white rounded-2xl transition-all">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleUpload} className="space-y-6">
                <div className="aspect-video glass rounded-[32px] overflow-hidden relative border border-white/10 group">
                  {selectedImage ? (
                    <img src={selectedImage} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600">
                      <div className="grid grid-cols-2 gap-4 w-full p-8">
                         <button 
                          type="button" 
                          onClick={() => setShowCamera(true)}
                          className="flex flex-col items-center gap-3 p-6 bg-white/5 border-2 border-dashed border-white/10 rounded-3xl hover:border-indigo-500/30 hover:text-indigo-400 transition-all"
                        >
                          <Camera size={32} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Kamera</span>
                        </button>
                        <label className="flex flex-col items-center gap-3 p-6 bg-white/5 border-2 border-dashed border-white/10 rounded-3xl hover:border-indigo-500/30 hover:text-indigo-400 transition-all cursor-pointer">
                          <Upload size={32} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Galeri</span>
                          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Judul Momen</label>
                  <input 
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 focus:outline-none transition-all font-bold"
                    placeholder="Contoh: Kencan Pertama"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Catatan Hati</label>
                  <textarea 
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 focus:outline-none transition-all h-28 resize-none font-medium"
                    placeholder="Tuliskan sesuatu tentang momen ini..."
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="ghost" fullWidth type="button" onClick={() => { setShowUpload(false); setSelectedImage(null); }} className="h-16 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Batal</Button>
                  <Button fullWidth type="submit" disabled={!selectedImage} className="h-16 text-sm font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20">Simpan Abadi</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="relative w-full max-w-5xl max-h-full flex flex-col md:flex-row glass rounded-[48px] overflow-hidden shadow-3xl border-white/10 animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-6 right-6 z-10 p-4 bg-slate-900/40 hover:bg-rose-500 text-white rounded-3xl transition-all backdrop-blur-md border border-white/10"
            >
              <X size={24} />
            </button>
            
            <div className="flex-1 bg-slate-900 flex items-center justify-center min-h-[300px] p-4">
              <img src={selectedPhoto.imageUrl} className="max-w-full max-h-[75vh] object-contain rounded-[24px] shadow-2xl" alt="" />
            </div>

            <div className="w-full md:w-96 p-10 flex flex-col bg-slate-900/40 backdrop-blur-3xl border-l border-white/5">
              <div className="flex items-center gap-4 mb-8">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedPhoto.uploaderName}`} className="w-14 h-14 rounded-2xl bg-indigo-500/10 p-1 border border-indigo-500/20" alt="" />
                <div>
                  <p className="font-black text-white text-lg tracking-tight">{selectedPhoto.uploaderName}</p>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{new Date(selectedPhoto.createdAt).toLocaleDateString('id-ID')}</p>
                </div>
              </div>

              <h3 className="text-3xl font-black text-white mb-4 tracking-tighter leading-tight">{selectedPhoto.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-medium flex-1 overflow-y-auto pr-2">{selectedPhoto.caption}</p>
              
              <div className="mt-10 pt-8 border-t border-white/5 flex gap-3">
                {(selectedPhoto.uploadedBy === currentUser.uid || currentUser.role === 'admin') && (
                  <Button variant="danger" fullWidth onClick={(e) => { handleDelete(selectedPhoto.photoId, e); setSelectedPhoto(null); }} className="h-14 font-black uppercase tracking-widest text-[10px]">Hapus Foto</Button>
                )}
                <Button variant="secondary" fullWidth onClick={() => setSelectedPhoto(null)} className="h-14 font-black uppercase tracking-widest text-[10px] border-white/10 bg-white/5">Tutup</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
