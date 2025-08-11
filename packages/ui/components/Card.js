import { jsx as _jsx } from "react/jsx-runtime";
export const Card = ({ children, className = '', padding = 'md' }) => {
    const paddingClasses = {
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6'
    };
    const classes = `bg-white rounded-lg shadow-md border ${paddingClasses[padding]} ${className}`;
    return (_jsx("div", { className: classes, children: children }));
};
