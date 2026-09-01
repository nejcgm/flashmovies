import { Link } from 'react-router-dom';

interface FormLinkProps {
  text: string;
  linkText: string;
  to: string;
}

export function FormLink({ text, linkText, to }: FormLinkProps) {
  return (
    <p className="text-center text-gray-400">
      {text}{' '}
      <Link
        to={to}
        className="text-[#f5c518] hover:text-yellow-400 font-medium transition-colors"
      >
        {linkText}
      </Link>
    </p>
  );
};

