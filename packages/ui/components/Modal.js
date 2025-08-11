import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen)
        return null;
    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl'
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: _jsxs("div", { className: "flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0", children: [_jsx("div", { className: "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity", onClick: onClose }), _jsxs("div", { className: `inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizeClasses[size]} sm:w-full`, children: [title && (_jsx("div", { className: "bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4", children: _jsx("h3", { className: "text-lg leading-6 font-medium text-gray-900", children: title }) })), _jsx("div", { className: "bg-white px-4 pt-5 pb-4 sm:p-6", children: children }), _jsx("div", { className: "bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse", children: _jsx("button", { type: "button", className: "mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm", onClick: onClose, children: "Close" }) })] })] }) }));
};
