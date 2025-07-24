// Location utilities
import type { Location } from '@brenda-cereals/types';

export const LOCATIONS: Location[] = [
  { name: "Nairobi", delivery: 300, coordinates: { lat: -1.2921, lng: 36.8219 } },
  { name: "Eldoret", delivery: 250, coordinates: { lat: 0.5143, lng: 35.2697 } },
  { name: "Kisumu", delivery: 350, coordinates: { lat: -0.1022, lng: 34.7617 } },
  { name: "Mombasa", delivery: 400, coordinates: { lat: -4.0435, lng: 39.6682 } },
  { name: "Nakuru", delivery: 280, coordinates: { lat: -0.3031, lng: 36.0800 } },
  { name: "Thika", delivery: 200, coordinates: { lat: -1.0332, lng: 37.0924 } },
  { name: "Machakos", delivery: 220, coordinates: { lat: -1.5177, lng: 37.2634 } },
];

export const getLocationByName = (name: string): Location | undefined => {
  return LOCATIONS.find(location => 
    location.name.toLowerCase() === name.toLowerCase()
  );
};

export const calculateDeliveryFee = (locationName: string): number => {
  const location = getLocationByName(locationName);
  return location?.delivery || 500; // Default fee if location not found
};

export const getLocationsByDeliveryFee = (maxFee: number): Location[] => {
  return LOCATIONS.filter(location => location.delivery <= maxFee);
};

export const getNearestLocation = (lat: number, lng: number): Location => {
  let nearest = LOCATIONS[0];
  let minDistance = Number.MAX_VALUE;
  
  LOCATIONS.forEach(location => {
    if (location.coordinates) {
      const distance = calculateDistance(
        lat, lng, 
        location.coordinates.lat, 
        location.coordinates.lng
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearest = location;
      }
    }
  });
  
  return nearest;
};

// Haversine formula to calculate distance between two coordinates
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
