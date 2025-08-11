"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Modal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen)
        return null;
    const sizeClasses = {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-xl'
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0", children: [(0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity", onClick: onClose }), (0, jsx_runtime_1.jsxs)("div", { className: `inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizeClasses[size]} sm:w-full`, children: [(0, jsx_runtime_1.jsx)("div", { className: "bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4", children: (0, jsx_runtime_1.jsx)("div", { className: "sm:flex sm:items-start", children: (0, jsx_runtime_1.jsx)("div", { className: "mt-3 text-center sm:mt-0 sm:text-left", children: (0, jsx_runtime_1.jsx)("h3", { className: "text-lg leading-6 font-medium text-gray-900", children: title }) }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "bg-white px-4 pt-5 pb-4 sm:p-6", children: children }), (0, jsx_runtime_1.jsx)("div", { className: "bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse", children: (0, jsx_runtime_1.jsx)("button", { type: "button", className: "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm", onClick: onClose, children: "Close" }) })] })] }) }));
};
exports.Modal = Modal;
