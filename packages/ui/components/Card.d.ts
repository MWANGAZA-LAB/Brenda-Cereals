import React from 'react';
interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}
export declare const Card: ({ children, className, onClick }: CardProps) => React.ReactElement;
export {};
