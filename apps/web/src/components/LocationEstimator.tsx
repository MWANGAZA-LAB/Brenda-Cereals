'use client';
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
  const [autoDetected, setAutoDetected] = useState<string | null>(null);

  function handleDetect() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // For demo, just pick Nairobi if latitude is negative, Eldoret if positive
        const { latitude } = pos.coords;
        if (latitude < 0) setAutoDetected("Nairobi");
        else setAutoDetected("Eldoret");
      },
      () => alert("Could not detect location."),
      { timeout: 5000 }
    );
  }

  const displayLocation = autoDetected || selected.name;
  const delivery = autoDetected
    ? locations.find((l) => l.name === autoDetected)?.delivery || selected.delivery
    : selected.delivery;

  return (
    <div className="w-full max-w-4xl mx-auto my-6 p-4 sm:p-6 bg-gray-50 rounded-lg shadow-sm">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
        {/* Location Selection - Mobile Optimized */}
        <div className="flex-1 w-full lg:w-auto">
          <label className="block text-sm font-medium mb-2 text-gray-700">Where are you ordering from?</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            value={selected.name}
            onChange={(e) => {
              setSelected(locations.find((l) => l.name === e.target.value) || locations[0]);
              setAutoDetected(null);
            }}
          >
            {locations.map((loc) => (
              <option key={loc.name} value={loc.name}>{loc.name}</option>
            ))}
          </select>
        </div>
        
        {/* Detect Location Button - Touch Friendly */}
        <button
          className="w-full lg:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all duration-200 active:scale-95"
          onClick={handleDetect}
          type="button"
        >
          Detect Location
        </button>
        
        {/* Delivery Fee Display - Mobile Optimized */}
        <div className="flex-1 w-full lg:w-auto text-center lg:text-right">
          <div className="text-sm text-gray-600 mb-1">
            Estimated delivery to <span className="font-bold text-gray-800">{displayLocation}</span>:
          </div>
          <div className="text-xl sm:text-2xl font-bold text-green-700">
            KSh {delivery}
          </div>
        </div>
      </div>
    </div>
  );
} 