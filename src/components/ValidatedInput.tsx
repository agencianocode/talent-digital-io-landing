
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValidatedInputProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  className?: string;
  disabled?: boolean;
}

const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  multiline = false,
  rows = 3,
  className,
  disabled = false
}) => {
  const hasError = Boolean(error);

  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      {multiline ? (
        <Textarea
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          rows={rows}
          disabled={disabled}
          className={cn(
            'transition-colors',
            hasError && 'border-destructive focus-visible:ring-destructive'
          )}
        />
      ) : (
        <Input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={cn(
            'transition-colors',
            hasError && 'border-destructive focus-visible:ring-destructive'
          )}
        />
      )}
      
      {hasError && (
        <div className="flex items-center space-x-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};

export default ValidatedInput;
