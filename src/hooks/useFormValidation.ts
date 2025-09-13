
import { useState, useCallback, useMemo } from 'react';
import { validateForm, validateField, ValidationRules, ValidationErrors } from '@/utils/validation';

interface UseFormValidationOptions {
  rules: ValidationRules;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export const useFormValidation = (
  initialData: Record<string, unknown> = {},
  options: UseFormValidationOptions
) => {
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateSingleField = useCallback((field: string, value: unknown) => {
    if (!options.rules[field]) return null;
    return validateField(value, options.rules[field]);
  }, [options.rules]);

  const validateAllFields = useCallback(() => {
    const newErrors = validateForm(data, options.rules);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [data, options.rules]);

  const setValue = useCallback((field: string, value: unknown) => {
    setData(prev => ({ ...prev, [field]: value }));

    if (options.validateOnChange) {
      const error = validateSingleField(field, value);
      setErrors(prev => ({
        ...prev,
        [field]: error || ''
      }));
    }
  }, [validateSingleField, options.validateOnChange]);

  const setFieldTouched = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));

    if (options.validateOnBlur) {
      const error = validateSingleField(field, data[field]);
      setErrors(prev => ({
        ...prev,
        [field]: error || ''
      }));
    }
  }, [validateSingleField, options.validateOnBlur, data]);

  const reset = useCallback((newData = initialData) => {
    setData(newData);
    setErrors({});
    setTouched({});
  }, [initialData]);

  const getFieldProps = useCallback((field: string) => ({
    value: data[field] || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
      setValue(field, e.target.value),
    onBlur: () => setFieldTouched(field),
    error: touched[field] ? errors[field] : undefined
  }), [data, errors, touched, setValue, setFieldTouched]);

  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0 && 
           Object.keys(options.rules).every(field => data[field] !== undefined && data[field] !== '');
  }, [errors, data, options.rules]);

  return {
    data,
    errors,
    touched,
    isValid,
    setValue,
    setFieldTouched,
    validateAllFields,
    reset,
    getFieldProps
  };
};
