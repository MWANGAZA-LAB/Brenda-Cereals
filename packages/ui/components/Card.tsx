import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = 'md' 
}) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };
  
  const classes = `bg-white rounded-lg shadow-md border ${paddingClasses[padding]} ${className}`;
  
  return (
    <div className={classes}>
      {children}
    </div>
  );
};
