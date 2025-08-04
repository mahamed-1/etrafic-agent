export interface VehicleData {
  plate: string;
  type: 'national' | 'transit' | 'diplomatic' | 'foreign';
  owner: string;
  validations: {
    registration: ValidationStatus;
    license: ValidationStatus;
    insurance: ValidationStatus;
    technical: ValidationStatus;
  };
}

export interface ValidationStatus {
  status: 'valid' | 'expired';
  source: string;
  expires: string;
  details: string;
}

export const mockVerifyVehicle = async (plate: string): Promise<VehicleData> => {
  // Simulation d'appel API
  await new Promise(resolve => setTimeout(resolve, 2000));

  const vehicleType = plate.startsWith('DJ') ? 'national' :
    plate.startsWith('ET') ? 'transit' :
      plate.startsWith('CD') ? 'diplomatic' : 'foreign';

  return {
    plate: plate,
    type: vehicleType,
    owner: 'MOHAMED Hassan Ali',
    validations: {
      registration: {
        status: 'valid',
        source: 'Ministère Intérieur',
        expires: '2025-12-15',
        details: 'Carte grise valide'
      },
      license: {
        status: 'valid',
        source: 'PSR',
        expires: '2027-03-20',
        details: 'Permis de conduire valide'
      },
      insurance: {
        status: 'valid',
        source: 'Amerga',
        expires: '2025-08-30',
        details: 'Assurance tous risques'
      },
      technical: {
        status: Math.random() > 0.3 ? 'expired' : 'valid',
        source: 'OTRACO',
        expires: '2024-11-15',
        details: 'Contrôle technique obligatoire'
      }
    }
  };
};

export const getTypeColor = (type: string): string => {
  switch (type) {
    case 'national': return '#2563eb'; // Retour au bleu original
    case 'transit': return '#f59e0b';
    case 'diplomatic': return '#7c3aed';
    default: return '#6b7280';
  }
};

export const getTypeLabel = (type: string): string => {
  switch (type) {
    case 'national': return 'National';
    case 'transit': return 'Transit';
    case 'diplomatic': return 'Diplomatique';
    default: return 'Étranger';
  }
};

export const formatPlateNumber = (text: string): string => {
  const upperText = text.toUpperCase();

  // Format DJ-####-AB
  if (upperText.startsWith('DJ')) {
    return upperText.replace(/^DJ(\d{0,4})([A-Z]{0,2})$/, (match, digits, letters) => {
      let formatted = 'DJ';
      if (digits) formatted += `-${digits}`;
      if (letters) formatted += `-${letters}`;
      return formatted;
    });
  }

  return upperText;
};