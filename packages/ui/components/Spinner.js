"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Spinner = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Spinner = ({ size = 'md', color = 'primary', className = '' }) => {
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
    return ((0, jsx_runtime_1.jsx)("div", { className: classes }));
};
exports.Spinner = Spinner;
