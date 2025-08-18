import { z } from 'zod';

// Real-time venue capacity and crowd energy tracking service
export interface VenueCapacityData {
  venueCapacity: number;
  currentAttendance: number;
  attendeeCount: number;
  capacityPercentage: number;
  status: 'available' | 'filling_fast' | 'nearly_full' | 'sold_out';
}

export interface CrowdEnergyData {
  energyLevel: number; // 0.0 to 1.0
  energyStatus: 'low' | 'moderate' | 'high' | 'explosive';
  lastUpdate: string;
  metrics: {
    socialBuzz: number;
    reviewSentiment: number;
    anticipationScore: number;
    bandPopularity: number;
  };
}

export interface VenueRealtimeData {
  tourId: string;
  capacity: VenueCapacityData;
  energy: CrowdEnergyData;
}

// Venue capacity database with realistic metal venue data
const VENUE_CAPACITY_DATABASE: Record<string, number> = {
  // Iconic Metal Venues
  "Wembley Stadium": 90000,
  "Madison Square Garden": 20000,
  "Red Rocks Amphitheatre": 9525,
  "Download Festival": 111000,
  "Hellfest": 180000,
  "Bloodstock": 18000,
  "Resurrection Fest": 150000,
  "Heavy Montreal": 75000,
  "Graspop Metal Meeting": 175000,
  "Wacken Open Air": 85000,
  // Classic Rock/Metal Venues
  "The Forum": 17500,
  "House of Blues": 2500,
  "The Fillmore": 1315,
  "Terminal 5": 3000,
  "The Warfield": 2300,
  "Brixton Academy": 4921,
  "Hammersmith Apollo": 5039,
  "The Wiltern": 1850,
  "Riviera Theatre": 2500,
  "The Paramount": 2807,
  // Small Metal Venues
  "The Metal Venue": 1200,
  "Underground Club": 800,
  "The Pit": 600,
  "Metal Underground": 450,
  "Rock Temple": 1500,
};

// Generate realistic crowd energy based on various factors
export function generateCrowdEnergyData(
  venue: string,
  bandName: string,
  daysUntilShow: number,
  capacityPercentage: number
): CrowdEnergyData {
  // Base energy factors
  const bandPopularityScore = getBandPopularityScore(bandName);
  const venuePrestigeScore = getVenuePrestigeScore(venue);
  const timeFactorScore = getTimeFactorScore(daysUntilShow);
  const capacityFactorScore = Math.min(capacityPercentage / 100, 1.0);

  // Social media buzz simulation (higher for popular bands/venues)
  const socialBuzz = Math.min(
    (bandPopularityScore * 0.4 + venuePrestigeScore * 0.3 + capacityFactorScore * 0.3) * 
    (0.8 + Math.random() * 0.4), // Add some randomness
    1.0
  );

  // Review sentiment (generally positive for metal shows)
  const reviewSentiment = Math.min(
    0.7 + (bandPopularityScore * 0.2) + (Math.random() * 0.2),
    1.0
  );

  // Anticipation score (increases as show approaches and capacity fills)
  const anticipationScore = Math.min(
    (timeFactorScore * 0.5 + capacityFactorScore * 0.5) * 
    (0.6 + Math.random() * 0.4),
    1.0
  );

  // Overall energy level calculation
  const energyLevel = Math.min(
    (socialBuzz * 0.3 + reviewSentiment * 0.2 + anticipationScore * 0.3 + bandPopularityScore * 0.2),
    1.0
  );

  const energyStatus: CrowdEnergyData['energyStatus'] = 
    energyLevel >= 0.8 ? 'explosive' :
    energyLevel >= 0.6 ? 'high' :
    energyLevel >= 0.4 ? 'moderate' : 'low';

  return {
    energyLevel: Math.round(energyLevel * 100) / 100,
    energyStatus,
    lastUpdate: new Date().toISOString(),
    metrics: {
      socialBuzz: Math.round(socialBuzz * 100) / 100,
      reviewSentiment: Math.round(reviewSentiment * 100) / 100,
      anticipationScore: Math.round(anticipationScore * 100) / 100,
      bandPopularity: Math.round(bandPopularityScore * 100) / 100,
    }
  };
}

// Get band popularity score based on known metal bands
function getBandPopularityScore(bandName: string): number {
  const popularityMap: Record<string, number> = {
    // Tier 1: Legendary metal bands
    'METALLICA': 1.0,
    'IRON MAIDEN': 0.98,
    'BLACK SABBATH': 0.96,
    'JUDAS PRIEST': 0.94,
    'SLAYER': 0.92,
    // Tier 2: Modern metal giants
    'TOOL': 0.90,
    'SYSTEM OF A DOWN': 0.88,
    'RAMMSTEIN': 0.86,
    'GHOST': 0.84,
    'SLIPKNOT': 0.82,
    // Tier 3: Rising/Popular modern bands
    'BAD OMENS': 0.80,
    'SPIRITBOX': 0.78,
    'LORNA SHORE': 0.76,
    'SLEEP TOKEN': 0.85,
    'ICE NINE KILLS': 0.74,
    'LANDMVRKS': 0.70,
    // Default for unknown bands
  };

  return popularityMap[bandName.toUpperCase()] || 0.5 + Math.random() * 0.3;
}

// Get venue prestige score
function getVenuePrestigeScore(venue: string): number {
  const prestigeMap: Record<string, number> = {
    'Wembley Stadium': 1.0,
    'Madison Square Garden': 0.98,
    'Download Festival': 0.95,
    'Hellfest': 0.92,
    'Wacken Open Air': 0.90,
    'Red Rocks Amphitheatre': 0.88,
    'Graspop Metal Meeting': 0.85,
    'Bloodstock': 0.80,
  };

  return prestigeMap[venue] || 0.6 + Math.random() * 0.2;
}

// Get time factor score (excitement builds as show approaches)
function getTimeFactorScore(daysUntilShow: number): number {
  if (daysUntilShow <= 1) return 1.0; // Day of show - maximum excitement
  if (daysUntilShow <= 7) return 0.9; // Week before - high excitement
  if (daysUntilShow <= 30) return 0.7; // Month before - building excitement
  if (daysUntilShow <= 90) return 0.5; // Advance booking - moderate excitement
  return 0.3; // Far future - low excitement
}

// Generate realistic venue capacity data
export function generateVenueCapacityData(venue: string, tourId: string): VenueCapacityData {
  const venueCapacity = VENUE_CAPACITY_DATABASE[venue] || 5000; // Default capacity
  
  // Generate realistic current attendance (70-95% for popular shows)
  const baseAttendance = Math.random() * 0.25 + 0.70; // 70-95%
  const currentAttendance = Math.floor(venueCapacity * baseAttendance);
  const capacityPercentage = Math.round((currentAttendance / venueCapacity) * 100);

  const status: VenueCapacityData['status'] = 
    capacityPercentage >= 98 ? 'sold_out' :
    capacityPercentage >= 85 ? 'nearly_full' :
    capacityPercentage >= 70 ? 'filling_fast' : 'available';

  // Real-time attendee count (slightly different from ticket sales)
  const attendeeCount = Math.floor(currentAttendance * (0.95 + Math.random() * 0.1));

  return {
    venueCapacity,
    currentAttendance,
    attendeeCount,
    capacityPercentage,
    status
  };
}

// Main function to get real-time venue data
export function getRealtimeVenueData(
  tourId: string,
  venue: string,
  bandName: string,
  showDate: string
): VenueRealtimeData {
  const daysUntilShow = Math.ceil((new Date(showDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  const capacity = generateVenueCapacityData(venue, tourId);
  const energy = generateCrowdEnergyData(venue, bandName, daysUntilShow, capacity.capacityPercentage);

  return {
    tourId,
    capacity,
    energy
  };
}

// WebSocket update simulation for real-time data
export function simulateRealtimeUpdates(data: VenueRealtimeData): VenueRealtimeData {
  // Simulate small changes in real-time data
  const capacityFluctuation = Math.random() * 0.02 - 0.01; // ±1%
  const energyFluctuation = Math.random() * 0.05 - 0.025; // ±2.5%

  const newAttendance = Math.max(0, 
    Math.min(data.capacity.venueCapacity, 
      Math.floor(data.capacity.currentAttendance * (1 + capacityFluctuation))
    )
  );

  const newEnergyLevel = Math.max(0, 
    Math.min(1.0, 
      data.energy.energyLevel + energyFluctuation
    )
  );

  return {
    ...data,
    capacity: {
      ...data.capacity,
      currentAttendance: newAttendance,
      attendeeCount: Math.floor(newAttendance * 0.98),
      capacityPercentage: Math.round((newAttendance / data.capacity.venueCapacity) * 100),
      status: 
        newAttendance / data.capacity.venueCapacity >= 0.98 ? 'sold_out' :
        newAttendance / data.capacity.venueCapacity >= 0.85 ? 'nearly_full' :
        newAttendance / data.capacity.venueCapacity >= 0.70 ? 'filling_fast' : 'available'
    },
    energy: {
      ...data.energy,
      energyLevel: Math.round(newEnergyLevel * 100) / 100,
      energyStatus: 
        newEnergyLevel >= 0.8 ? 'explosive' :
        newEnergyLevel >= 0.6 ? 'high' :
        newEnergyLevel >= 0.4 ? 'moderate' : 'low',
      lastUpdate: new Date().toISOString(),
    }
  };
}