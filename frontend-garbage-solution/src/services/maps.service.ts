import { api } from './api';

export interface LocationRequest {
  latitude: number;
  longitude: number;
}

export interface NearbyLocation {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  isOpen: boolean;
  distance: number;
  bankName: string;
}

export const getNearbyLocations = async (request: LocationRequest): Promise<NearbyLocation[]> => {
  return await api.get(`/Maps/nearby?latitude=${request.latitude}&longitude=${request.longitude}`);
};
