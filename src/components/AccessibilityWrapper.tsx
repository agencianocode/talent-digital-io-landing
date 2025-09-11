import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AccessibilityWrapperProps {
  children: React.ReactNode;
  skipLinkText?: string;
  skipLinkTarget?: string;
  className?: string;
}

export const AccessibilityWrapper: React.FC<AccessibilityWrapperProps> = ({
  children,
  skipLinkText = 'Saltar al contenido principal',
  skipLinkTarget = '#main-content',
  className
}) => {
  // Announce route changes to screen readers
  useEffect(() => {
    const announceRouteChange = () => {
      const pageTitle = document.title;
      const announcement = `Navegaste a ${pageTitle}`;
      
      // Create a live region for announcements
      let liveRegion = document.getElementById('route-announcer');
      if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'route-announcer';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);
      }
      
      // Clear and set new announcement
      liveRegion.textContent = '';
      setTimeout(() => {
        liveRegion!.textContent = announcement;
      }, 100);
    };

    // Announce current page on mount
    setTimeout(announceRouteChange, 100);
    
    // Listen for route changes (React Router doesn't fire popstate)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(announceRouteChange, 100);
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      setTimeout(announceRouteChange, 100);
    };
    
    window.addEventListener('popstate', announceRouteChange);
    
    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', announceRouteChange);
    };
  }, []);

  // Focus management for single-page navigation
  useEffect(() => {
    const handleFocusManagement = () => {
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Set focus to main content for screen readers
        mainContent.focus();
      }
    };

    // Small delay to ensure content is rendered
    const timer = setTimeout(handleFocusManagement, 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={cn('min-h-screen', className)}>
      {/* Skip Link for Keyboard Navigation */}
      <a 
        href={skipLinkTarget}
        className="skip-link"
        onFocus={(e) => e.currentTarget.style.top = '6px'}
        onBlur={(e) => e.currentTarget.style.top = '-40px'}
      >
        {skipLinkText}
      </a>
      
      {/* Main Application Content */}
      <div id="main-content" tabIndex={-1} className="focus:outline-none">
        {children}
      </div>
      
      {/* Live Region for Dynamic Announcements */}
      <div 
        id="live-announcements" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      />
      
      {/* Status Messages Live Region */}
      <div 
        id="status-announcements" 
        aria-live="assertive" 
        aria-atomic="true" 
        className="sr-only"
      />
    </div>
  );
};

// Hook for making announcements to screen readers
export const useAnnouncement = () => {
  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const liveRegionId = priority === 'assertive' ? 'status-announcements' : 'live-announcements';
    const liveRegion = document.getElementById(liveRegionId);
    
    if (liveRegion) {
      // Clear previous message
      liveRegion.textContent = '';
      
      // Set new message after a brief delay
      setTimeout(() => {
        liveRegion.textContent = message;
      }, 100);
      
      // Clear message after being announced
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 5000);
    }
  };

  return { announceToScreenReader };
};

export default AccessibilityWrapper;