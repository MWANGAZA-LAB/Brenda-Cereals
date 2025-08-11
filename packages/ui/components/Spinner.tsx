import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export const Spinner = ({ 
  size = 'md', 
  color = 'primary', 
  className = '' 
}: SpinnerProps): React.ReactElement => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  
  const colorClasses = {
    primary: 'border-green-600',
    secondary: 'border-gray-600',
    white: 'border-white'
  };
  
  const classes = `animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]} ${className}`;
  
  return (
    <div className={classes}></div>
  );
};
