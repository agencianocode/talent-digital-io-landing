import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from 'sonner';

export interface FileUploadResult {
  url: string;
  name: string;
  size: number;
  type: string;
}

export const useFileUpload = () => {
  const { user } = useSupabaseAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFile = async (file: File): Promise<FileUploadResult | null> => {
    if (!user) {
      toast.error('Debes estar autenticado para subir archivos');
      return null;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('El archivo es demasiado grande. Máximo 10MB');
      return null;
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de archivo no permitido');
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${user.id}/${timestamp}_${sanitizedName}`;

      console.log('[useFileUpload] Uploading file:', filePath);

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('message-attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('[useFileUpload] Upload error:', error);
        throw error;
      }

      // Get signed URL (válida por 1 año)
      const { data: urlData, error: urlError } = await supabase.storage
        .from('message-attachments')
        .createSignedUrl(filePath, 31536000); // 1 año en segundos

      if (urlError) {
        console.error('[useFileUpload] Error getting signed URL:', urlError);
        throw urlError;
      }

      console.log('[useFileUpload] Upload successful:', urlData.signedUrl);

      setUploadProgress(100);
      toast.success('Archivo subido correctamente');

      return {
        url: urlData.signedUrl,
        name: file.name,
        size: file.size,
        type: file.type
      };

    } catch (error) {
      console.error('[useFileUpload] Error uploading file:', error);
      toast.error('Error al subir el archivo');
      return null;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const deleteFile = async (fileUrl: string | undefined): Promise<boolean> => {
    if (!user || !fileUrl) return false;

    try {
      // Extract file path from URL
      const urlParts = fileUrl.split('/message-attachments/');
      if (urlParts.length !== 2 || !urlParts[1]) {
        throw new Error('Invalid file URL');
      }
      const filePath: string = urlParts[1];

      console.log('[useFileUpload] Deleting file:', filePath);

      const { error } = await supabase.storage
        .from('message-attachments')
        .remove([filePath]);

      if (error) throw error;

      console.log('[useFileUpload] File deleted successfully');
      return true;

    } catch (error) {
      console.error('[useFileUpload] Error deleting file:', error);
      return false;
    }
  };

  return {
    uploadFile,
    deleteFile,
    isUploading,
    uploadProgress
  };
};

