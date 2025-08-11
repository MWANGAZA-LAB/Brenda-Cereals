'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
const locations = [
    { name: "Nairobi", delivery: 300 },
    { name: "Eldoret", delivery: 250 },
    { name: "Kisumu", delivery: 350 },
    { name: "Mombasa", delivery: 400 },
    { name: "Nakuru", delivery: 280 },
];
export default function LocationEstimator() {
    const [selected, setSelected] = useState(locations[0]);
    const [autoDetected, setAutoDetected] = useState(null);
    function handleDetect() {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }
        navigator.geolocation.getCurrentPosition((pos) => {
            // For demo, just pick Nairobi if latitude is negative, Eldoret if positive
            const { latitude } = pos.coords;
            if (latitude < 0)
                setAutoDetected("Nairobi");
            else
                setAutoDetected("Eldoret");
        }, () => alert("Could not detect location."), { timeout: 5000 });
    }
    const displayLocation = autoDetected || selected.name;
    const delivery = autoDetected
        ? locations.find((l) => l.name === autoDetected)?.delivery || selected.delivery
        : selected.delivery;
    return (_jsxs("div", { className: "w-full max-w-xl mx-auto my-6 p-4 bg-gray-50 rounded shadow flex flex-col md:flex-row items-center gap-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("label", { className: "block text-sm font-medium mb-1", children: "Where are you ordering from?" }), _jsx("select", { className: "w-full border rounded px-3 py-2", value: selected.name, onChange: (e) => {
                            setSelected(locations.find((l) => l.name === e.target.value) || locations[0]);
                            setAutoDetected(null);
                        }, children: locations.map((loc) => (_jsx("option", { value: loc.name, children: loc.name }, loc.name))) })] }), _jsx("button", { className: "px-4 py-2 bg-green-600 text-white rounded font-semibold", onClick: handleDetect, type: "button", children: "Detect Location" }), _jsxs("div", { className: "flex-1 text-center md:text-right", children: [_jsxs("div", { className: "text-sm text-gray-600 mb-1", children: ["Estimated total to ", _jsx("span", { className: "font-bold", children: displayLocation }), ":"] }), _jsxs("div", { className: "text-lg font-bold text-green-700", children: ["Ksh ", delivery] })] })] }));
}
