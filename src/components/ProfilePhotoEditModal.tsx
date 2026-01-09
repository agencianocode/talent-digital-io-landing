import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ProfilePhotoEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (croppedImageBlob: Blob) => void;
  imageFile: File | null;
}

const ProfilePhotoEditModal = ({ isOpen, onClose, onSave, imageFile }: ProfilePhotoEditModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize with imageFile if provided
  useEffect(() => {
    if (imageFile) {
      setSelectedFile(imageFile);
      const url = URL.createObjectURL(imageFile);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setSelectedFile(null);
      setImageUrl('');
      return undefined;
    }
  }, [imageFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Limitar el movimiento dentro del contenedor
      const maxX = 100;
      const maxY = 100;
      
      setPosition({
        x: Math.max(-maxX, Math.min(maxX, newX)),
        y: Math.max(-maxY, Math.min(maxY, newY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newScale = Math.max(0.5, Math.min(3, scale + (e.deltaY > 0 ? -0.1 : 0.1)));
    setScale(newScale);
  };

  const cropImage = (): Promise<Blob | null> => {
    if (!imageRef.current || !canvasRef.current) return Promise.resolve(null);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return Promise.resolve(null);

    const size = 200;
    canvas.width = size;
    canvas.height = size;

    // Crear un círculo
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
    ctx.clip();

    // Dibujar la imagen escalada y posicionada
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.scale(scale, scale);
    ctx.translate(position.x, position.y);
    ctx.drawImage(imageRef.current, -size / 2, -size / 2, size, size);
    ctx.restore();

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.9);
    });
  };

  const handleSave = async () => {
    if (!selectedFile) return;
    
    const blob = await cropImage();
    if (blob) {
      onSave(blob);
    }
  };

  const handleOpenFileDialog = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold font-['Inter']">Editar foto de perfil</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Select File Button */}
          {!selectedFile && (
            <div className="text-center py-8">
              <Button
                onClick={handleOpenFileDialog}
                variant="outline"
                className="w-full font-['Inter']"
              >
                Seleccionar imagen
              </Button>
            </div>
          )}

          {/* Image Editor */}
          {selectedFile && imageUrl && (
            <>
              <div className="text-center">
                <div
                  ref={containerRef}
                  className="relative w-64 h-64 mx-auto bg-black/90 cursor-move overflow-hidden rounded-none"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onWheel={handleWheel}
                >
                  {/* Full image */}
                  <img
                    ref={imageRef}
                    src={imageUrl}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-contain rounded-none"
                    style={{
                      transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                      transformOrigin: 'center center'
                    }}
                    draggable={false}
                  />
                  
                  {/* Circular crop overlay - shows darkened area outside circle */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Dark overlay with circular cutout using CSS mask */}
                    <div 
                      className="absolute inset-0 bg-black/50"
                      style={{
                        maskImage: 'radial-gradient(circle at center, transparent 45%, black 45%)',
                        WebkitMaskImage: 'radial-gradient(circle at center, transparent 45%, black 45%)'
                      }}
                    />
                    {/* Circular border indicator */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-[90%] h-[90%] rounded-full border-2 border-white/80 border-dashed" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Arrastra para mover • Usa la rueda del mouse para zoom
                </p>
              </div>

              {/* Controls */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-['Inter']">
                    Zoom: {Math.round(scale * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <Button
                  onClick={handleOpenFileDialog}
                  variant="outline"
                  className="w-full font-['Inter']"
                >
                  Cambiar imagen
                </Button>
              </div>
            </>
          )}

          {/* Canvas for cropping (hidden) */}
          <canvas
            ref={canvasRef}
            className="hidden"
          />

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 font-['Inter']"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!selectedFile}
              className="flex-1 bg-slate-900 hover:bg-slate-800 font-['Inter'] disabled:opacity-50"
            >
              Guardar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePhotoEditModal;