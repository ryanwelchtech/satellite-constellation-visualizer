// CelesTrak API - Free, No API Key Required
// Data source: https://celestrak.org

const CELESTRAK_BASE = 'https://celestrak.org/NORAD/elements/gp.php';

export interface TLEData {
  name: string;
  line1: string;
  line2: string;
  noradId: string;
}

export interface ParsedTLE {
  name: string;
  noradId: string;
  classification: string;
  launchYear: number;
  launchNumber: number;
  inclination: number;
  raan: number;
  eccentricity: number;
  argOfPerigee: number;
  meanAnomaly: number;
  meanMotion: number;
  revolutionNumber: number;
  line1: string;
  line2: string;
}

// Available constellation groups from CelesTrak
export const CONSTELLATION_GROUPS = {
  GPS: 'gps-ops',
  GLONASS: 'glo-ops',
  GALILEO: 'galileo',
  BEIDOU: 'beidou',
  STARLINK: 'starlink',
  ONEWEB: 'oneweb',
  IRIDIUM: 'iridium-NEXT',
  WEATHER: 'weather',
  NOAA: 'noaa',
  GEO: 'geo',
  INTELSAT: 'intelsat',
  SES: 'ses',
  ISS: 'stations',
  MILITARY: 'military',
  SCIENCE: 'science',
  EARTH_RESOURCES: 'resource',
} as const;

export type ConstellationGroup = keyof typeof CONSTELLATION_GROUPS;

class CelesTrakService {
  private cache: Map<string, { data: TLEData[]; timestamp: number }> = new Map();
  private CACHE_DURATION = 60 * 60 * 1000; // 1 hour cache

  // Fetch TLE data for a constellation group
  async fetchConstellation(group: ConstellationGroup): Promise<TLEData[]> {
    const groupId = CONSTELLATION_GROUPS[group];
    const cacheKey = groupId;

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await fetch(
        `${CELESTRAK_BASE}?GROUP=${groupId}&FORMAT=tle`,
        { mode: 'cors' }
      );

      if (!response.ok) {
        throw new Error(`CelesTrak API error: ${response.status}`);
      }

      const text = await response.text();
      const tleData = this.parseTLEText(text);

      // Cache the result
      this.cache.set(cacheKey, { data: tleData, timestamp: Date.now() });

      return tleData;
    } catch (error) {
      console.error(`Failed to fetch ${group} constellation:`, error);
      throw error;
    }
  }

  // Fetch multiple constellations
  async fetchMultipleConstellations(groups: ConstellationGroup[]): Promise<Map<ConstellationGroup, TLEData[]>> {
    const results = new Map<ConstellationGroup, TLEData[]>();

    await Promise.all(
      groups.map(async (group) => {
        try {
          const data = await this.fetchConstellation(group);
          results.set(group, data);
        } catch (error) {
          console.error(`Failed to fetch ${group}:`, error);
          results.set(group, []);
        }
      })
    );

    return results;
  }

  // Parse TLE text format (3 lines per satellite)
  private parseTLEText(text: string): TLEData[] {
    const lines = text.trim().split('\n');
    const satellites: TLEData[] = [];

    for (let i = 0; i < lines.length; i += 3) {
      if (i + 2 >= lines.length) break;

      const name = lines[i].trim();
      const line1 = lines[i + 1].trim();
      const line2 = lines[i + 2].trim();

      // Extract NORAD ID from line 1 (characters 3-7)
      const noradId = line1.substring(2, 7).trim();

      satellites.push({ name, line1, line2, noradId });
    }

    return satellites;
  }

  // Parse full TLE details
  parseTLEDetails(tle: TLEData): ParsedTLE {
    const line1 = tle.line1;
    const line2 = tle.line2;

    return {
      name: tle.name,
      noradId: tle.noradId,
      classification: line1.charAt(7),
      launchYear: parseInt(line1.substring(9, 11)),
      launchNumber: parseInt(line1.substring(11, 14)),
      inclination: parseFloat(line2.substring(8, 16)),
      raan: parseFloat(line2.substring(17, 25)), // Right Ascension of Ascending Node
      eccentricity: parseFloat('0.' + line2.substring(26, 33)),
      argOfPerigee: parseFloat(line2.substring(34, 42)),
      meanAnomaly: parseFloat(line2.substring(43, 51)),
      meanMotion: parseFloat(line2.substring(52, 63)), // revolutions per day
      revolutionNumber: parseInt(line2.substring(63, 68)),
      line1,
      line2,
    };
  }

  // Calculate orbital period from mean motion
  calculateOrbitalPeriod(meanMotion: number): number {
    // Mean motion is in revolutions per day
    // Period in minutes = 24 * 60 / meanMotion
    return (24 * 60) / meanMotion;
  }

  // Estimate altitude from mean motion (simplified)
  estimateAltitude(meanMotion: number): number {
    // Using simplified formula: a = (μ/n²)^(1/3)
    // where μ = 398600.4418 km³/s², n = mean motion in rad/s
    const MU = 398600.4418;
    const EARTH_RADIUS = 6371;

    // Convert mean motion from rev/day to rad/s
    const n = (meanMotion * 2 * Math.PI) / (24 * 60 * 60);

    // Semi-major axis
    const a = Math.pow(MU / (n * n), 1 / 3);

    // Altitude = semi-major axis - Earth radius
    return Math.max(0, a - EARTH_RADIUS);
  }

  // Determine orbit type based on altitude
  getOrbitType(altitude: number): 'LEO' | 'MEO' | 'GEO' | 'HEO' {
    if (altitude < 2000) return 'LEO';
    if (altitude < 35786) return 'MEO';
    if (altitude >= 35786 && altitude <= 35800) return 'GEO';
    return 'HEO';
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

export const celestrakApi = new CelesTrakService();
export default celestrakApi;
