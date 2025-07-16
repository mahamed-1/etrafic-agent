// src/services/api.ts
import axios from 'axios';

// À remplacer par votre IP locale et port Spring Boot
const API_BASE_URL = 'http://192.168.100.150:8080/api'; 

export const getInfractions = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/infractions`);
    return response.data;
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
};