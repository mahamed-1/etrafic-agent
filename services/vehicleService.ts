import { apiService } from './api';

export interface VehicleDetails {
    id: string;
    plaque: string;
    registrationNumber: string;
    chassisNumber: string;
    engineNumber: string;
    brand: string;
    model: string;
    color: string | null;
    manufactureYear: number;
    fuelType: string | null;
    vehicleType: string | null;
    registrationDate: string;
    status: string;
    ownerUserId: string;
    ownerUsername: string;
}

export interface VehicleVerification {
    assuranceValide: boolean;
    carteGriseValide: boolean;
    permisValide: boolean;
    message?: string;
}

export interface CreatePVResponse {
    id: string;
    vehiculeId: string;
    infractionIds: string[];
    createdAt: string;
}

export interface PVLocation {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    country?: string;
    landmark?: string;
}

export interface Vehicle {
    plaque: string;
    marque: string;
    modele: string;
    couleur: string;
    proprietaire: {
        nom: string;
        prenom: string;
        telephone: string;
        adresse: string;
    };
    assurance: {
        compagnie: string;
        numeroPolice: string;
        validite: string;
    };
    visite: {
        derniere: string;
        prochaine: string;
        status: 'valide' | 'expire' | 'bientot_expire';
    };
}

// Recherche des détails du véhicule
export const getVehicleDetails = async (plate: string): Promise<VehicleDetails> => {
    const response = await apiService.get(`/vehicules/search?plaque=${plate}`);
    return response.data;
};

// Vérification du véhicule
export const verifyVehicle = async (plate: string): Promise<VehicleVerification> => {
    const response = await apiService.get(`/integration/verification/vehicle/${plate}`);
    return response.data;
};

// Création d'un PV
export const createPV = async (
    vehiculeId: string,
    infractionIds: string[],
    photos: { uri: string; name: string; type: string }[],
    documentDescriptions?: string,
    location?: PVLocation
): Promise<CreatePVResponse> => {
    const formData = new FormData();
    photos.forEach(photo => {
        formData.append('documents', {
            uri: photo.uri,
            name: photo.name,
            type: photo.type,
        } as any);
    });

    // Construction de la query string
    const params = new URLSearchParams();
    params.append('vehiculeId', vehiculeId);
    infractionIds.forEach(id => params.append('infractionIds', id));
    if (documentDescriptions) params.append('documentDescriptions', documentDescriptions);
    if (location) params.append('location', JSON.stringify(location));

    const response = await apiService.post(
        `/pvs?${params.toString()}`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );

    return response.data;
};

// Obtenir le nombre de PV créés par l'agent aujourd'hui
export const getPVCountByAgent = async (): Promise<number> => {
    // Appel API pour récupérer tous les PV de l'agent
    const response = await apiService.get('/pvs/my-pvs-as-agent');

    if (Array.isArray(response.data)) {
        // Obtenir la date du jour au format YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];

        // Filtrer les PV créés aujourd'hui
        const todayPVs = response.data.filter((pv: any) => {
            if (pv.createdAt) {
                const pvDate = new Date(pv.createdAt).toISOString().split('T')[0];
                return pvDate === today;
            }
            return false;
        });

        return todayPVs.length;
    }
    return 0;
};

// Interface pour un PV récent
export interface RecentPV {
    id: string;
    plaque: string;
    infractions: string;
    montantAmande: number;
    createdAt: string;
    lieu?: string;
}

// Récupérer les PV récents de l'agent
export const getRecentPVsByAgent = async (limit: number = 5): Promise<RecentPV[]> => {
    try {
        const response = await apiService.get('/pvs/my-pvs-as-agent');

        if (Array.isArray(response.data)) {
            // Trier par date de création (plus récent en premier)
            const sortedPVs = response.data.sort((a: any, b: any) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

            // Prendre seulement les plus récents et formater
            return sortedPVs.slice(0, limit).map((pv: any) => ({
                id: pv.id,
                plaque: pv.vehicule?.plaque || pv.vehicule?.registrationNumber || 'N/A',
                infractions: pv.infractions?.[0]?.type || pv.infractions?.[0]?.type || 'Infraction non spécifiée',
                montantAmande: pv.infractions?.[0]?.montantAmande || 0,
                createdAt: pv.createdAt,
                lieu: pv.location?.address || pv.location?.city || ''
            }));
        }
        return [];
    } catch (error) {
        console.error('Erreur lors de la récupération des PV récents:', error);
        return [];
    }
};

// Interface pour les informations de synchronisation
export interface SyncInfo {
    lastSyncTime: string;
    pendingCount: number;
    syncedCount: number;
    status: 'success' | 'pending' | 'error';
}

// Interface pour les statistiques du jour
export interface DailyStats {
    controls: number;
    compliant: number;
    violations: number;
    totalAmount: number;
}

// Récupérer les statistiques du jour de l'agent
export const getDailyStatsByAgent = async (): Promise<DailyStats> => {
    try {
        // Récupérer tous les PV de l'agent
        const response = await apiService.get('/pvs/my-pvs-as-agent');

        if (Array.isArray(response.data)) {
            // Obtenir la date du jour
            const today = new Date().toISOString().split('T')[0];

            // Filtrer les PV créés aujourd'hui
            const todayPVs = response.data.filter((pv: any) => {
                if (pv.createdAt) {
                    const pvDate = new Date(pv.createdAt).toISOString().split('T')[0];
                    return pvDate === today;
                }
                return false;
            });

            // Calculer les statistiques
            const violations = todayPVs.length;
            const totalAmount = todayPVs.reduce((sum: number, pv: any) => {
                return sum + (pv.infractions?.[0]?.montantAmande || 0);
            }, 0);

            // Pour les contrôles et conformes, on peut estimer ou ajouter d'autres endpoints
            // Pour l'instant, on utilise une estimation basée sur les PV
            const estimatedControls = Math.max(violations * 2, 10); // Estimation : 2 contrôles par PV minimum
            const compliant = estimatedControls - violations;

            return {
                controls: estimatedControls,
                compliant: Math.max(compliant, 0),
                violations: violations,
                totalAmount: totalAmount
            };
        }

        return {
            controls: 0,
            compliant: 0,
            violations: 0,
            totalAmount: 0
        };
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques du jour:', error);
        // Retourner des valeurs par défaut en cas d'erreur
        return {
            controls: 0,
            compliant: 0,
            violations: 0,
            totalAmount: 0
        };
    }
};

// Récupérer les informations de synchronisation
export const getSyncInfo = async (): Promise<SyncInfo> => {
    try {
        // Cette fonction peut être étendue pour appeler un endpoint spécifique de sync
        // Pour l'instant, on utilise les données des PV pour simuler
        const response = await apiService.get('/pvs/my-pvs-as-agent');

        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

        if (Array.isArray(response.data)) {
            const recentPVs = response.data.filter((pv: any) => {
                return new Date(pv.createdAt) > oneHourAgo;
            });

            return {
                lastSyncTime: new Date(now.getTime() - 60 * 60 * 1000).toISOString(), // Il y a 1h
                pendingCount: 0, // Supposer que tout est synchronisé
                syncedCount: recentPVs.length,
                status: 'success'
            };
        }

        return {
            lastSyncTime: new Date().toISOString(),
            pendingCount: 0,
            syncedCount: 0,
            status: 'success'
        };
    } catch (error) {
        console.error('Erreur lors de la récupération des infos de sync:', error);
        return {
            lastSyncTime: new Date().toISOString(),
            pendingCount: 0,
            syncedCount: 0,
            status: 'error'
        };
    }
};
