import { apiService } from './api';

export interface ViolationType {
    id: string;
    type: string;
    description: string;
    lieu: string;
    gravite: string;
    montantAmande: number;
}

export interface GetViolationTypesResponse {
    violations: ViolationType[];
    total: number;
    page: number;
    per_page: number;
}

export const getViolationTypes = async (
    page: number = 1,
    perPage: number = 20,
    category?: string
): Promise<ViolationType[]> => {
    const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
    });

    if (category) {
        params.append('category', category);
    }

    const response = await apiService.get(`/infractions`);
    return response.data.violations || response.data;
};

export const violationService = {
    async getViolationTypes(
        page: number = 1,
        perPage: number = 20,
        category?: string
    ): Promise<GetViolationTypesResponse> {
        const params = new URLSearchParams({
            page: page.toString(),
            per_page: perPage.toString(),
        });

        if (category) {
            params.append('category', category);
        }

        const response = await apiService.get(`/violations/types?${params.toString()}`);
        return response.data;
    },

    async getViolationTypeById(id: string): Promise<ViolationType> {
        const response = await apiService.get(`/violations/types/${id}`);
        return response.data;
    },

    async searchViolationTypes(query: string): Promise<ViolationType[]> {
        const response = await apiService.get(`/violations/types/search?q=${encodeURIComponent(query)}`);
        return response.data.violations;
    }
};
