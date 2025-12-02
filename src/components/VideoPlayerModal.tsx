import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  title = 'Video de Presentación',
}) => {
  
  const getEmbedUrl = (url: string): string => {
    try {
      // YouTube
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        if (url.includes('youtu.be/')) {
          videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
        } else if (url.includes('youtube.com/watch?v=')) {
          videoId = url.split('v=')[1]?.split('&')[0] || '';
        } else if (url.includes('youtube.com/embed/')) {
          return url; // Ya está en formato embed
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
      }
      
      // Vimeo
      if (url.includes('vimeo.com')) {
        const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
        return videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=1` : url;
      }
      
      // Loom
      if (url.includes('loom.com')) {
        const videoId = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/)?.[1];
        return videoId ? `https://www.loom.com/embed/${videoId}?autoplay=1` : url;
      }
      
      // Google Drive
      if (url.includes('drive.google.com')) {
        const fileId = url.match(/\/file\/d\/([^\/]+)/)?.[1] || url.match(/[?&]id=([^&]+)/)?.[1];
        return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : url;
      }
      
      // Dropbox
      if (url.includes('dropbox.com')) {
        // Convertir URL de Dropbox a formato embed
        return url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
      }
      
      // Para otras URLs, intentar usar como iframe directo
      return url;
    } catch (error) {
      console.error('Error processing video URL:', error);
      return url;
    }
  };

  const getPlatformName = (url: string): string => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    if (url.includes('vimeo.com')) return 'Vimeo';
    if (url.includes('loom.com')) return 'Loom';
    if (url.includes('drive.google.com')) return 'Google Drive';
    if (url.includes('dropbox.com')) return 'Dropbox';
    return 'Video';
  };

  const embedUrl = getEmbedUrl(videoUrl);
  const platform = getPlatformName(videoUrl);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full p-0 gap-0 bg-black/95">
        <DialogHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-lg font-semibold">
              {title}
              <span className="text-sm text-gray-400 ml-2">• {platform}</span>
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/10 rounded-full h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
          <iframe
            src={embedUrl}
            title={title}
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ border: 'none' }}
          />
        </div>
        
        <div className="p-4 text-center">
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Abrir en {platform} ↗
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerModal;

