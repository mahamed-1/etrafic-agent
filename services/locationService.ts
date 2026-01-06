import { apiService } from './api';

export interface AgentLocation {
    latitude: number;
    longitude: number;
    address: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

// Met à jour la position de l'agent authentifié
// Met à jour la position de l'agent authentifié via apiService
export async function updateMyLocation(location: AgentLocation): Promise<any> {
    const response = await apiService.put('/agents/my-location', location);
    console.log('Réponse brute:', response);
    return response.data;
}
