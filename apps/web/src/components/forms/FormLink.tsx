import React from 'react';
import { Link } from 'react-router-dom';

interface FormLinkProps {
  text: string;
  linkText: string;
  to: string;
}

const FormLink: React.FC<FormLinkProps> = ({ text, linkText, to }) => {
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

export default FormLink;
