import React from 'react';

interface FormErrorProps {
  message: string | null;
}

const FormError: React.FC<FormErrorProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded-lg">
      <p className="text-red-400 text-sm text-center">{message}</p>
    </div>
  );
};

export default FormError;
