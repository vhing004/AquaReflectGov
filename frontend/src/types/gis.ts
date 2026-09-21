export interface GeoJsonGeometry {
  type: 'Point';
  coordinates: [number, number]; // [Longitude, Latitude] theo chuẩn RFC 7946
}

export interface PetitionSpatialProperties {
  id: string;
  trackingCode: string;
  title: string;
  categoryId?: string;
  categoryName?: string;
  categoryType?: string;
  status?: string;
  statusName?: string;
  priorityLevel?: string;
  priorityName?: string;
  addressText?: string;
  administrativeUnitId?: number;
  administrativeUnitName?: string;
  createdAt: string;
  dueDate?: string;
  isOverdue: boolean;
  attachmentsCount: number;
}

export interface GeoJsonFeature {
  type: 'Feature';
  id: string;
  geometry: GeoJsonGeometry;
  properties: PetitionSpatialProperties;
}

export interface GeoJsonFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
  totalCount: number;
}

export interface SpatialRadiusItem {
  id: string;
  trackingCode: string;
  title: string;
  categoryName?: string;
  categoryType?: string;
  status?: string;
  statusName?: string;
  priorityLevel?: string;
  priorityName?: string;
  addressText?: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  distanceMeters: number;
  createdAt: string;
  isOverdue: boolean;
}

export interface SpatialRadiusResult {
  centerLatitude: number;
  centerLongitude: number;
  radiusKm: number;
  totalCount: number;
  items: SpatialRadiusItem[];
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  weight: number;
  type?: string;
  code?: string;
}

export interface HeatmapData {
  totalPoints: number;
  maxWeight: number;
  points: HeatmapPoint[];
  rawArray: [number, number, number][]; // [lat, lng, weight]
}

export interface DistrictSummary {
  administrativeUnitId: number;
  districtCode: string;
  districtName: string;
  totalCount: number;
  submittedCount: number;
  inProgressCount: number;
  resolvedCount: number;
  overdueCount: number;
  iuuCount: number;
  diseaseCount: number;
  pollutionCount: number;
  otherCount: number;
  centerLat?: number;
  centerLng?: number;
}

export interface CategoryDistribution {
  categoryId: string;
  categoryName: string;
  categoryType: string;
  count: number;
  percentage: number;
}

export interface SpatialSummary {
  totalPetitionsWithLocation: number;
  totalDistrictsCovered: number;
  districtSummaries: DistrictSummary[];
  categoryDistribution: CategoryDistribution[];
}

export interface GisFilterParams {
  minLat?: number;
  maxLat?: number;
  minLng?: number;
  maxLng?: number;
  categoryId?: string;
  status?: string;
  priorityLevel?: string;
  isOverdueOnly?: boolean;
  administrativeUnitId?: number;
  fromDate?: string;
  toDate?: string;
}
