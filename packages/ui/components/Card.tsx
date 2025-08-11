import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card = ({ children, className = '', onClick }: CardProps): React.ReactElement => {
  const classes = `bg-white rounded-lg shadow-md p-6 ${className}`;
  
  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};
