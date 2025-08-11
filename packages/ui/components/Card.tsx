import React, { type ReactElement } from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export const Card = ({ 
  children, 
  className = '', 
  padding = 'md' 
}: CardProps): ReactElement => {
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
