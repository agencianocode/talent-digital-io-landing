import { useState, useEffect } from 'react';

interface MobileBreakpoints {
  isMobile: boolean;      // < 768px
  isTablet: boolean;      // 768px - 1024px
  isDesktop: boolean;     // > 1024px
  isSmallMobile: boolean; // < 480px
  isLargeMobile: boolean; // 480px - 768px
  isLargeDesktop: boolean; // > 1440px
}

export const useMobile = (): MobileBreakpoints => {
  const [breakpoints, setBreakpoints] = useState<MobileBreakpoints>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isSmallMobile: false,
    isLargeMobile: false,
    isLargeDesktop: false,
  });

  useEffect(() => {
    const checkBreakpoints = () => {
      const width = window.innerWidth;
      
      setBreakpoints({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        isSmallMobile: width < 480,
        isLargeMobile: width >= 480 && width < 768,
        isLargeDesktop: width > 1440,
      });
    };

    // Check on mount
    checkBreakpoints();

    // Add event listener
    window.addEventListener('resize', checkBreakpoints);

    // Cleanup
    return () => window.removeEventListener('resize', checkBreakpoints);
  }, []);

  return breakpoints;
};

// Hook específico para detectar si es móvil (compatibilidad con código existente)
export const useIsMobile = (): boolean => {
  const { isMobile } = useMobile();
  return isMobile;
};

// Hook para detectar orientación del dispositivo
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const checkOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  return orientation;
};

// Hook para detectar si el dispositivo tiene touch
export const useTouchDevice = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  return isTouchDevice;
};
