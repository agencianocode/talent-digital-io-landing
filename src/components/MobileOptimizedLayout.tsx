import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const MobileOptimizedLayout: React.FC<MobileOptimizedLayoutProps> = ({
  children,
  sidebar,
  header,
  footer,
  className
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className={cn('min-h-screen flex flex-col', className)}>
      {/* Header */}
      {header && (
        <header className="sticky top-0 z-40 bg-background border-b">
          <div className="flex items-center justify-between p-4">
            {header}
            {sidebar && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>
        </header>
      )}

      <div className="flex flex-1 relative">
        {/* Desktop Sidebar */}
        {sidebar && (
          <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:bg-card">
            {sidebar}
          </aside>
        )}

        {/* Mobile Sidebar Overlay */}
        {sidebar && isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Mobile Sidebar */}
            <aside className="fixed left-0 top-0 z-50 h-full w-80 max-w-[80vw] bg-background border-r md:hidden animate-slide-in-right">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-semibold">Menú</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Cerrar menú"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="overflow-y-auto h-[calc(100vh-4rem)]">
                {sidebar}
              </div>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      {footer && (
        <footer className="mt-auto border-t bg-card">
          {footer}
        </footer>
      )}
    </div>
  );
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className
}) => {
  const gapClasses = {
    sm: 'gap-2 sm:gap-4',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8'
  };

  const gridClasses = cn(
    'grid',
    `grid-cols-${columns.mobile}`,
    columns.tablet && `sm:grid-cols-${columns.tablet}`,
    columns.desktop && `lg:grid-cols-${columns.desktop}`,
    gapClasses[gap],
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

interface MobileStackProps {
  children: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MobileStack: React.FC<MobileStackProps> = ({
  children,
  spacing = 'md',
  className
}) => {
  const spacingClasses = {
    sm: 'space-y-2 sm:space-y-4',
    md: 'space-y-4 sm:space-y-6',
    lg: 'space-y-6 sm:space-y-8'
  };

  return (
    <div className={cn('flex flex-col', spacingClasses[spacing], className)}>
      {children}
    </div>
  );
};

export default {
  MobileOptimizedLayout,
  ResponsiveGrid,
  MobileStack
};