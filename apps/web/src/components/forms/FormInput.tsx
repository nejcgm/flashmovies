import React from 'react';

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
}

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
}) => {
  return (
    <div>
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-gray-300 mb-2"
      >
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        className="w-full px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg 
                   text-white placeholder-gray-500 focus:outline-none focus:ring-2 
                   focus:ring-[#f5c518] focus:border-transparent transition-all"
        placeholder={placeholder}
      />
    </div>
  );
};

export default FormInput;
