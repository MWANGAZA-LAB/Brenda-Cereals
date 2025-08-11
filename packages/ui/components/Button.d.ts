import React from 'react';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    children: React.ReactNode;
}
export declare const Button: ({ variant, size, loading, className, children, disabled, ...props }: ButtonProps) => React.ReactElement;
export {};
