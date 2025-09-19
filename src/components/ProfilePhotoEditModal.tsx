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
  const [imageUrl, setImageUrl] = useState<string>('');
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleSave = () => {
    if (canvasRef.current && imageRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = imageRef.current;
      
      if (ctx && img.complete) {
        // Limpiar canvas con fondo transparente
        ctx.clearRect(0, 0, 300, 300);
        
        // Crear máscara circular
        ctx.save();
        ctx.beginPath();
        ctx.arc(150, 150, 150, 0, 2 * Math.PI);
        ctx.clip();
        
        // Calcular el tamaño para que la imagen llene completamente el círculo
        const canvasSize = 300; // Tamaño del canvas
        const imgAspect = img.naturalWidth / img.naturalHeight;
        let drawWidth, drawHeight;
        
        // Usar el lado más largo de la imagen para llenar el círculo
        if (imgAspect > 1) {
          // Imagen más ancha que alta - usar ancho como referencia
          drawWidth = canvasSize * scale;
          drawHeight = drawWidth / imgAspect;
        } else {
          // Imagen más alta que ancha - usar altura como referencia
          drawHeight = canvasSize * scale;
          drawWidth = drawHeight * imgAspect;
        }
        
        // Calcular posición centrada
        const centerX = 150 - (drawWidth / 2) + position.x;
        const centerY = 150 - (drawHeight / 2) + position.y;
        
        // Dibujar imagen
        ctx.drawImage(img, centerX, centerY, drawWidth, drawHeight);
        ctx.restore();
        
        // Convertir a base64
        const croppedImage = canvas.toDataURL('image/png');
        onSave(croppedImage);
        onClose();
      } else {
        // Si la imagen no está cargada, usar la imagen original
        onSave(imageUrl);
        onClose();
      }
    }
  };

  const handleImageLoad = () => {
    // Centrar la imagen inicialmente
    setPosition({
      x: 0,
      y: 0
    });
  };

  // Resetear estado cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #374151;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #374151;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900 font-['Inter']">Editar foto de perfil</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Instructions */}
        <p className="text-sm text-slate-600 mb-6 font-['Inter']">
          Ajusta tu foto de perfil. Puedes hacer zoom y mover la imagen para obtener el mejor encuadre.
        </p>

        {/* Image Preview Area */}
        <div className="relative mb-6">
          <div 
            ref={containerRef}
            className="w-full h-[300px] bg-slate-800 rounded-xl overflow-hidden relative flex items-center justify-center"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            {/* Image */}
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Profile preview"
              className="max-w-[280px] max-h-[280px] object-contain pointer-events-none rounded-full"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: 'center'
              }}
              onLoad={handleImageLoad}
              draggable={false}
            />
            
            {/* Circular crop indicator */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-[280px] h-[280px] border-2 border-white border-dashed rounded-full opacity-50"></div>
              </div>
            </div>
          </div>
          
          {/* Hidden canvas for cropping */}
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            className="hidden"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {/* Icono de imagen pequeña */}
          <div className="w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
          </div>
          
          {/* Slider de zoom */}
          <div className="flex-1 max-w-40">
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          
          {/* Icono de imagen grande */}
          <div className="w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-slate-500 rounded-full"></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 font-['Inter']"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 bg-slate-900 hover:bg-slate-800 font-['Inter'] disabled:opacity-50"
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePhotoEditModal;
