export const AGENT_INFO = {
  name: 'Agent AHMED',
  badge: 'PSR-2587',
  zone: 'Zone Port',
  mission: 'Contrôle véhicules lourds'
};

export const TODAY_STATS = {
  controls: 23,
  compliant: 18,
  violations: 5,
  amount: 125000
};

export const PLATE_PATTERNS = [
  { type: 'national', pattern: 'DJ-####-AB', description: 'Véhicule djiboutien' },
  { type: 'diplomatic', pattern: 'CD-###-FR', description: 'Corps diplomatique' },
  { type: 'transit', pattern: 'ET-####-AB', description: 'Transit éthiopien' },
  { type: 'military', pattern: 'US-###-MIL', description: 'Militaire US' },
];

export const VIOLATION_TYPES = [
  { id: 'speed_10_20', name: 'Excès vitesse 10-20 km/h', fine: 5000, category: 'speed' },
  { id: 'speed_20_30', name: 'Excès vitesse 20-30 km/h', fine: 10000, category: 'speed' },
  { id: 'speed_30_plus', name: 'Excès vitesse +30 km/h', fine: 25000, category: 'speed' },
  { id: 'no_insurance', name: 'Défaut assurance', fine: 25000, category: 'document' },
  { id: 'no_license', name: 'Conduite sans permis', fine: 30000, category: 'document' },
  { id: 'expired_technical', name: 'Contrôle technique expiré', fine: 15000, category: 'document' },
  { id: 'phone_driving', name: 'Téléphone au volant', fine: 3000, category: 'behavior' },
  { id: 'seatbelt', name: 'Ceinture sécurité', fine: 2000, category: 'safety' },
  { id: 'parking', name: 'Stationnement interdit', fine: 3000, category: 'parking' },
  { id: 'red_light', name: 'Feu rouge grillé', fine: 8000, category: 'traffic' },
  { id: 'drunk_driving', name: 'Conduite en état d\'ivresse', fine: 50000, category: 'dangerous' },
  { id: 'overload', name: 'Surcharge véhicule', fine: 20000, category: 'technical' },
];

export const MESSAGES = [
  {
    id: 1,
    type: 'weather',
    title: 'Alerte météo',
    message: 'Vents de sable prévus 14h - Réduire vitesse',
    time: '13:30'
  },
  {
    id: 2,
    type: 'mission',
    title: 'Nouvelle mission',
    message: 'Renfort demandé RN1 km 15',
    time: '13:15'
  }
];