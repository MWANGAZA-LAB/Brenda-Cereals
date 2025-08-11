import React, { type ReactElement } from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export const Spinner = ({ 
  size = 'md', 
  color = 'primary', 
  className = '' 
}: SpinnerProps): ReactElement => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };
  
  const colorClasses = {
    primary: 'border-green-600',
    secondary: 'border-gray-600',
    white: 'border-white'
  };
  
  const classes = `animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]} ${className}`;
  
  return (
    <div className={classes}></div>
  );
};
