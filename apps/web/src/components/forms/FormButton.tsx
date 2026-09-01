import type { ReactNode } from 'react';
import { Spinner } from "..";

interface FormButtonProps {
  loading: boolean;
  loadingText: string;
  children: ReactNode;
  className?: string;
}

export function FormButton({
  loading,
  loadingText,
  children,
  className = '',
}: FormButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`w-full py-3 px-4 bg-[#f5c518] hover:bg-yellow-600 text-black font-semibold 
                 rounded-lg transition-all duration-300 flex items-center justify-center
                 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <>
          <Spinner />
          <span className="ml-2">{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

