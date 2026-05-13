import React, { useState } from 'react';

interface FormInputProps {
  id: string;
  name: string;
  type: 'text' | 'email' | 'password';
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  showPasswordToggle?: boolean;
}

const EyeIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const EyeSlashIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19 12 19c1.292 0 2.531-.22 3.683-.626M6.228 6.228A10.45 10.45 0 0 1 12 5c4.756 0 8.773 2.662 10.065 7A10.52 10.52 0 0 1 12 15c-1.716 0-3.324-.403-4.756-1.083M3 3l3.59 3.59m0 0A9.953 9.953 0 0 1 12 5c4.756 0 8.773 2.662 10.065 7a10.528 10.528 0 0 1-4.293 5.21m0 0L21 21" />
  </svg>
);

const FormInput: React.FC<FormInputProps> = ({
  id,
  name,
  type,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  minLength,
  autoComplete,
  showPasswordToggle = false,
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = type === 'password';
  const effectiveType =
    isPassword && showPasswordToggle && passwordVisible ? 'text' : type;

  const inputEl = (
    <input
      type={effectiveType}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      minLength={minLength}
      autoComplete={autoComplete}
      className={`w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg 
                 text-white placeholder-gray-500 focus:outline-none focus:ring-2 
                 focus:ring-[#f5c518] focus:border-transparent transition-all
                 ${isPassword && showPasswordToggle ? 'pr-12' : ''}`}
      placeholder={placeholder}
    />
  );

  return (
    <div>
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-gray-300 mb-2"
      >
        {label}
      </label>
      {isPassword && showPasswordToggle ? (
        <div className="relative">
          {inputEl}
          <button
            type="button"
            aria-label={passwordVisible ? 'Hide password' : 'Show password'}
            aria-pressed={passwordVisible}
            className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-white/5 hover:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c518]"
            onClick={() => setPasswordVisible((v) => !v)}
          >
            {passwordVisible ? <EyeIcon /> : <EyeSlashIcon />}
          </button>
        </div>
      ) : (
        inputEl
      )}
    </div>
  );
};

export default FormInput;
