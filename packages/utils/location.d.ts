import type { Location } from '../types';
export declare const LOCATIONS: Location[];
export declare const getLocationByName: (name: string) => Location | undefined;
export declare const calculateDeliveryFee: (locationName: string) => number;
export declare const getLocationsByDeliveryFee: (maxFee: number) => Location[];
export declare const getNearestLocation: (lat: number, lng: number) => Location;
