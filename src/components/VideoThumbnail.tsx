import React, { useState, useEffect } from 'react';
import { Video } from 'lucide-react';

interface VideoThumbnailProps {
  url: string;
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({ url }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [platform, setPlatform] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const extractThumbnail = async () => {
      setIsLoading(true);
      
      try {
        let thumbnail = '';
        let detectedPlatform = '';

        // YouTube
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          const videoId = extractYouTubeVideoId(url);
          if (videoId) {
            thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            detectedPlatform = 'YouTube';
          }
        }
        // Vimeo
        else if (url.includes('vimeo.com')) {
          const videoId = extractVimeoVideoId(url);
          if (videoId) {
            // Para Vimeo necesitaríamos hacer una llamada a la API, pero por simplicidad usamos un placeholder
            thumbnail = `https://vumbnail.com/${videoId}.jpg`;
            detectedPlatform = 'Vimeo';
          }
        }
        // Loom
        else if (url.includes('loom.com')) {
          // Loom no proporciona miniaturas públicas fácilmente, usamos un placeholder
          thumbnail = '';
          detectedPlatform = 'Loom';
        }
        // Google Drive
        else if (url.includes('drive.google.com')) {
          const fileId = extractGoogleDriveFileId(url);
          if (fileId) {
            // Google Drive thumbnail usando el ID del archivo
            thumbnail = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1920`;
            detectedPlatform = 'Google Drive';
          }
        }
        // Dropbox
        else if (url.includes('dropbox.com')) {
          thumbnail = '';
          detectedPlatform = 'Dropbox';
        }

        setThumbnailUrl(thumbnail);
        setPlatform(detectedPlatform);
      } catch (error) {
        console.error('Error extracting thumbnail:', error);
        setThumbnailUrl(null);
        setPlatform('');
      } finally {
        setIsLoading(false);
      }
    };

    extractThumbnail();
  }, [url]);

  const extractYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match?.[1] || null;
  };

  const extractVimeoVideoId = (url: string): string | null => {
    const regex = /vimeo\.com\/(\d+)/;
    const match = url.match(regex);
    return match?.[1] || null;
  };

  const extractGoogleDriveFileId = (url: string): string | null => {
    // Soporta formatos: 
    // - https://drive.google.com/file/d/FILE_ID/view
    // - https://drive.google.com/open?id=FILE_ID
    const patterns = [
      /\/file\/d\/([^\/]+)/,
      /[?&]id=([^&]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match?.[1]) {
        return match[1];
      }
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  if (thumbnailUrl && platform !== 'Loom') {
    return (
      <div className="absolute inset-0">
        <img
          src={thumbnailUrl}
          alt={`Video thumbnail - ${platform}`}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={() => {
            // Si falla la carga de la imagen, mostrar placeholder
            setThumbnailUrl(null);
          }}
        />
        {/* Play icon overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="p-3 bg-black/50 rounded-full">
            <Video className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>
    );
  }

  // Fallback para Loom o cuando no se puede obtener thumbnail
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
      <div className="text-center">
        <div className="p-3 bg-white/90 rounded-full mb-3 mx-auto w-fit">
          <Video className="h-6 w-6 text-blue-600" />
        </div>
        <p className="text-sm font-medium text-gray-700 mb-2">Video de Presentación</p>
        <p className="text-xs text-gray-500">
          {platform ? `Video en ${platform}` : 'Video personalizado'}
        </p>
      </div>
    </div>
  );
};

export default VideoThumbnail;
