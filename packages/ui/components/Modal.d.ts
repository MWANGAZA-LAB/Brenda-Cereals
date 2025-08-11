import React from 'react';
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}
export declare const Modal: ({ isOpen, onClose, title, children, size }: ModalProps) => React.ReactElement | null;
export {};
