'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { FaBars, FaShoppingCart, FaGlobe } from "react-icons/fa";
export default function MobileNavbar({ cartCount = 0, onLangSwitch = () => { } }) {
    const [open, setOpen] = useState(false);
    return (_jsxs("nav", { className: "fixed bottom-0 left-0 w-full bg-white border-t shadow z-50 flex md:hidden justify-between items-center px-4 py-2", children: [_jsx("button", { onClick: () => setOpen(!open), className: "text-2xl", children: _jsx(FaBars, {}) }), _jsx("span", { className: "font-bold text-lg", children: "Brenda Cereals" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("button", { className: "relative", children: [_jsx(FaShoppingCart, { className: "text-2xl" }), cartCount > 0 && (_jsx("span", { className: "absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full px-1", children: cartCount }))] }), _jsx("button", { onClick: onLangSwitch, className: "text-xl", children: _jsx(FaGlobe, {}) })] }), open && (_jsxs("div", { className: "absolute bottom-12 left-2 right-2 bg-white rounded shadow p-4", children: [_jsx("div", { className: "mb-2 font-semibold", children: "Menu" }), _jsxs("ul", { className: "space-y-2", children: [_jsx("li", { children: _jsx("a", { href: "#", children: "Home" }) }), _jsx("li", { children: _jsx("a", { href: "#", children: "Products" }) }), _jsx("li", { children: _jsx("a", { href: "#", children: "Checkout" }) }), _jsx("li", { children: _jsx("a", { href: "#", children: "Admin" }) })] })] }))] }));
}
