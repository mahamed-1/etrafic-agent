import { apiService } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    approvalStatus: string;
    approvalDate: string;
    approvedById: string;
    approvedByUsername: string;
    approvalComments: string;
    documents: {
        id: string;
        name: string;
        description: string;
        documentType: string;
        filePath: string;
        uploadedAt: string;
    }[];
    ownerUserId: string;
    ownerUsername: string;
    ownerFullname: string;
    ownerMail: string;
    phoneNumber: string;
    isUnassigned: boolean;
    ownerPhoneNumber: string;
    ownerEmail: string;
    ownerCin: string;
    claimedById: string;
    claimedByUsername: string;
    claimedByFullname: string;
    claimedByEmail: string;
    claimedByPhoneNumber: string;
    claimedAt: string;
}

export interface VehicleVerification {
    assuranceValide: boolean;
    carteGriseValide: boolean;
    permisValide: boolean;
    message?: string;
}

export interface CreatePVResponse {
    id: string;
    vehiclePlaque: string;
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
    const response = await apiService.get(`/vehicules/search-fetch?plaque=${plate}`);
    return response.data;
};

// Vérification du véhicule
export const verifyVehicle = async (plate: string): Promise<VehicleVerification> => {
    const response = await apiService.get(`/integration/verification/vehicle/${plate}`);
    return response.data;
};

// Création d'un PV
export const createPV = async (
    vehiclePlaque: string,
    infractionIds: string[],
    photos: { uri: string; name: string; type: string }[],
    documentDescriptions?: string,
    location?: PVLocation
): Promise<CreatePVResponse> => {
    try {
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
        params.append('vehiclePlaque', vehiclePlaque);
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
    } catch (error: any) {
        console.error('❌ Erreur création PV:', error);

        if (error?.response?.status === 403) {
            // Erreur d'autorisation - le refresh token devrait maintenant fonctionner
            console.error('🔒 Erreur 403: Accès refusé');

            // Vérifier si c'est un problème de permissions utilisateur ou de token
            const errorMessage = error?.response?.data?.message || '';
            if (errorMessage.includes('permission') || errorMessage.includes('role')) {
                throw new Error('Vous n\'avez pas les permissions pour créer un PV. Contactez votre administrateur.');
            } else {
                throw new Error('Session expirée. La page va se recharger automatiquement.');
            }
        }

        if (error?.response?.status === 401) {
            throw new Error('Session expirée. Veuillez vous reconnecter.');
        }

        if (error?.name === 'AuthenticationError') {
            // Erreur personnalisée du service API
            throw error;
        }

        if (error?.response?.status >= 500) {
            throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
        }

        if (error?.response?.status === 400) {
            const message = error?.response?.data?.message || 'Données invalides';
            throw new Error(`Erreur de validation: ${message}`);
        }

        // Pour toutes les autres erreurs
        const message = error?.response?.data?.message || error?.message || 'Erreur lors de la création du PV';
        throw new Error(message);
    }
};

// Obtenir le nombre de PV créés par l'agent aujourd'hui
export const getPVCountByAgent = async (): Promise<number> => {
    try {
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
    } catch (error: any) {
        console.error('Erreur lors de la récupération des PV de l\'agent:', error);

        // Si erreur 403, l'utilisateur n'a pas les permissions ou n'est pas un agent
        if (error?.response?.status === 403) {
            console.warn('Accès refusé à l\'endpoint /pvs/my-pvs-as-agent. Vérifiez que l\'utilisateur est bien authentifié comme agent.');
            // Retourner 0 au lieu de faire crash l'app
            return 0;
        }

        // Pour les autres erreurs, lancer l'exception
        throw error;
    }
};

// Interface pour un PV récent
export interface RecentPVInfraction {
    id: string;
    type: string;
    description?: string;
    montantAmande: number;
}

export interface RecentPV {
    id: string;
    plaque: string;
    infractions: string; // Keep for backward compatibility
    infractionsDetails: RecentPVInfraction[]; // New field for full infraction details
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
            return sortedPVs.slice(0, limit).map((pv: any) => {
                const infractions = Array.isArray(pv.infractions) ? pv.infractions : [];
                const infractionsDetails = infractions.map((inf: any) => ({
                    id: inf.id,
                    type: inf.type || 'Infraction non spécifiée',
                    description: inf.description || '',
                    montantAmande: inf.montantAmande || 0
                }));

                return {
                    id: pv.id,
                    plaque: pv.vehicule?.plaque || pv.vehicule?.registrationNumber || 'N/A',
                    infractions: infractions.map((inf: any) => inf.type).join(', ') || 'Infraction non spécifiée',
                    infractionsDetails: infractionsDetails,
                    montantAmande: infractionsDetails.reduce((sum, inf) => sum + inf.montantAmande, 0),
                    createdAt: pv.createdAt,
                    lieu: pv.location?.address || pv.location?.city || ''
                };
            });
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
// export const getDailyStatsByAgent = async (): Promise<DailyStats> => {
//     try {
//         // Récupérer tous les PV de l'agent
//         const response = await apiService.get('/pvs/my-pvs-as-agent');

//         if (Array.isArray(response.data)) {
//             // Obtenir la date du jour
//             const today = new Date().toISOString().split('T')[0];

//             // Filtrer les PV créés aujourd'hui
//             const todayPVs = response.data.filter((pv: any) => {
//                 if (pv.createdAt) {
//                     const pvDate = new Date(pv.createdAt).toISOString().split('T')[0];
//                     return pvDate === today;
//                 }
//                 return false;
//             });

//             // Calculer les statistiques
//             const violations = todayPVs.length;
//             const totalAmount = todayPVs.reduce((sum: number, pv: any) => {
//                 return sum + (pv.infractions?.[0]?.montantAmande || 0);
//             }, 0);

//             // Pour les contrôles et conformes, on peut estimer ou ajouter d'autres endpoints
//             // Pour l'instant, on utilise une estimation basée sur les PV
//             const estimatedControls = Math.max(violations * 2, 10); // Estimation : 2 contrôles par PV minimum
//             const compliant = estimatedControls - violations;

//             return {
//                 controls: estimatedControls,
//                 compliant: Math.max(compliant, 0),
//                 violations: violations,
//                 totalAmount: totalAmount
//             };
//         }

//         return {
//             controls: 0,
//             compliant: 0,
//             violations: 0,
//             totalAmount: 0
//         };
//     } catch (error) {
//         console.error('Erreur lors de la récupération des statistiques du jour:', error);
//         // Retourner des valeurs par défaut en cas d'erreur
//         return {
//             controls: 0,
//             compliant: 0,
//             violations: 0,
//             totalAmount: 0
//         };
//     }
// };
// ...existing code...
export const getDailyStatsByAgent = async (agentId: string): Promise<DailyStats> => {
    try {
        // Violations (PV)
        const pvResponse = await apiService.get('/pvs/my-pvs-as-agent');
        const today = new Date().toISOString().split('T')[0];
        const todayPVs = Array.isArray(pvResponse.data)
            ? pvResponse.data.filter((pv: any) => {
                if (pv.createdAt) {
                    const pvDate = new Date(pv.createdAt).toISOString().split('T')[0];
                    return pvDate === today;
                }
                return false;
            })
            : [];
        const violations = todayPVs.length;
        const totalAmount = todayPVs.reduce((sum: number, pv: any) => {
            return sum + (pv.infractions?.[0]?.montantAmande || 0);
        }, 0);

        // Conformes
        const compliant = await getConformeCountByAgent(agentId);

        // Contrôles = conformes + violations
        const controls = compliant + violations;

        return {
            controls,
            compliant,
            violations,
            totalAmount
        };
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques du jour:', error);
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



export const getConformeCountByAgent = async (): Promise<number> => {
    try {
        const userJson = await AsyncStorage.getItem('psr_user');
        if (!userJson) {
            console.error('psr_user est undefined !');
            return 0;
        }
        const user = JSON.parse(userJson);
        const agentId = user.id;
        console.log('AgentId utilisé pour conforme:', agentId); // <-- Ajout du log ici
        if (!agentId) {
            console.error('agentId est undefined !');
            return 0;
        }
        const response = await apiService.get(`/controle/ok/conforme?agentId=${agentId}`);
        console.log('Réponse conforme:', response.data); // <-- Log de la réponse API
        return response.data.count ?? 0;
    } catch (error) {
        console.error('Erreur lors de la récupération des conformes:', error);
        return 0;
    }
};
