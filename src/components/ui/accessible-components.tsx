import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronDown, X } from 'lucide-react';

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  children: React.ReactNode;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  variant = 'default',
  size = 'default',
  loading = false,
  children,
  disabled,
  className,
  ...props
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || loading}
      className={cn(
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'transition-all duration-200',
        loading && 'cursor-not-allowed opacity-50',
        className
      )}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          <span className="sr-only">Cargando...</span>
          {children}
        </div>
      ) : (
        children
      )}
    </Button>
  );
};

interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const AccessibleInput: React.FC<AccessibleInputProps> = ({
  label,
  error,
  helperText,
  required = false,
  className,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText ? `${inputId}-helper` : undefined;

  return (
    <div className="space-y-2">
      <label 
        htmlFor={inputId}
        className="text-sm font-medium text-foreground flex items-center gap-1"
      >
        {label}
        {required && (
          <span className="text-destructive" aria-label="campo requerido">*</span>
        )}
      </label>
      
      <input
        id={inputId}
        required={required}
        aria-invalid={!!error}
        aria-describedby={cn(errorId, helperId).trim() || undefined}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2',
          'text-sm ring-offset-background file:border-0 file:bg-transparent',
          'file:text-sm file:font-medium placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          'transition-colors duration-200',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        {...props}
      />
      
      {helperText && (
        <p id={helperId} className="text-xs text-muted-foreground">
          {helperText}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

interface AccessibleSelectProps {
  label: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export const AccessibleSelect: React.FC<AccessibleSelectProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  helperText,
  required = false,
  placeholder = 'Selecciona una opción',
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  
  const selectId = `select-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${selectId}-error` : undefined;
  const helperId = helperText ? `${selectId}-helper` : undefined;

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (isOpen && focusedIndex >= 0 && focusedIndex < options.length) {
          onChange?.(options[focusedIndex].value);
          setIsOpen(false);
        } else {
          setIsOpen(!isOpen);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => 
            prev < options.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : options.length - 1
          );
        }
        break;
    }
  };

  return (
    <div className="space-y-2">
      <label 
        htmlFor={selectId}
        className="text-sm font-medium text-foreground flex items-center gap-1"
      >
        {label}
        {required && (
          <span className="text-destructive" aria-label="campo requerido">*</span>
        )}
      </label>
      
      <div ref={selectRef} className="relative">
        <div
          id={selectId}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-invalid={!!error}
          aria-describedby={cn(errorId, helperId).trim() || undefined}
          tabIndex={0}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-input',
            'bg-background px-3 py-2 text-sm ring-offset-background',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'cursor-pointer transition-colors duration-200',
            error && 'border-destructive focus:ring-destructive',
            className
          )}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
        >
          <span className={selectedOption ? 'text-foreground' : 'text-muted-foreground'}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown className={cn(
            'h-4 w-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )} />
        </div>
        
        {isOpen && (
          <ul
            ref={listRef}
            role="listbox"
            className={cn(
              'absolute z-50 w-full mt-1 bg-background border border-input rounded-md',
              'shadow-lg max-h-60 overflow-auto'
            )}
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                className={cn(
                  'px-3 py-2 text-sm cursor-pointer transition-colors duration-150',
                  'hover:bg-accent hover:text-accent-foreground',
                  option.value === value && 'bg-accent text-accent-foreground',
                  index === focusedIndex && 'bg-muted',
                  option.disabled && 'opacity-50 cursor-not-allowed'
                )}
                onClick={() => {
                  if (!option.disabled) {
                    onChange?.(option.value);
                    setIsOpen(false);
                  }
                }}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {helperText && (
        <p id={helperId} className="text-xs text-muted-foreground">
          {helperText}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else {
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className={cn(
          'bg-background rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto',
          'focus:outline-none',
          className
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 id="modal-title" className="text-lg font-semibold">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1 hover:bg-accent rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default {
  AccessibleButton,
  AccessibleInput,
  AccessibleSelect,
  AccessibleModal
};