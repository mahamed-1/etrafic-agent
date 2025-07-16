export interface Violation {
  id: string;
  name: string;
  fine: number;
  category: string;
  timestamp?: string;
}

export const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'speed': return '#f59e0b';
    case 'document': return '#dc2626';
    case 'behavior': return '#8b5cf6';
    case 'safety': return '#ef4444';
    case 'parking': return '#06b6d4';
    case 'traffic': return '#ec4899';
    case 'dangerous': return '#991b1b';
    case 'technical': return '#059669';
    default: return '#6b7280';
  }
};

export const calculateTotal = (violations: Violation[], controlType: string): number => {
  const base = violations.reduce((sum, v) => sum + v.fine, 0);
  const surcharge = controlType === 'transit' ? base : 0; // 100% surcharge pour transit
  return base + surcharge;
};

export const generateTicketNumber = (): string => {
  return `DJ2025-${Date.now()}`;
};

export interface Ticket {
  number: string;
  date: string;
  agent: string;
  vehicle: any;
  violations: Violation[];
  total: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  photos: string[];
}

export const generateTicket = (
  vehicleData: any,
  violations: Violation[],
  controlType: string,
  photos: string[]
): Ticket => {
  return {
    number: generateTicketNumber(),
    date: new Date().toISOString(),
    agent: 'Agent AHMED - PSR-2587',
    vehicle: vehicleData,
    violations: violations,
    total: calculateTotal(violations, controlType),
    location: { 
      lat: 11.588, 
      lng: 43.145, 
      address: 'Boulevard de la République, Zone Port' 
    },
    photos: photos,
  };
};