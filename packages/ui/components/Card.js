"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Card = ({ children, className = '', onClick }) => {
    const classes = `bg-white rounded-lg shadow-md p-6 ${className}`;
    return ((0, jsx_runtime_1.jsx)("div", { className: classes, onClick: onClick, children: children }));
};
exports.Card = Card;
