"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Button = ({ variant = 'primary', size = 'md', loading = false, className = '', children, disabled, ...props }) => {
    const baseClasses = 'font-semibold rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    const variantClasses = {
        primary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    };
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
    };
    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
    return ((0, jsx_runtime_1.jsx)("button", { className: classes, disabled: disabled || loading, ...props, children: loading ? ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" }), "Loading..."] })) : (children) }));
};
exports.Button = Button;
