import React from 'react';
import Button from './Button';

interface DangerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const DangerButton: React.FC<DangerButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <Button
      variant="primary"
      className={`bg-red-600 hover:bg-red-700 text-white border-none shadow-lg shadow-red-100 ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
};

export default DangerButton;
