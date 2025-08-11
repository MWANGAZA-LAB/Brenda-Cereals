import React from 'react';
interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: 'primary' | 'secondary' | 'white';
    className?: string;
}
export declare const Spinner: ({ size, color, className }: SpinnerProps) => React.ReactElement;
export {};
