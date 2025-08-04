// src/services/ListInfraction.ts
import { apiService } from './api';

export const getInfractions = async () => {
  const response = await apiService.get('/infractions');
  return response.data;
};
