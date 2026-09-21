import axiosClient from './axiosClient';
import type { ApiResponse } from '../types';
import type {
  GeoJsonFeatureCollection,
  SpatialRadiusResult,
  HeatmapData,
  SpatialSummary,
  GisFilterParams,
} from '../types/gis';

export const gisApi = {
  /**
   * Lấy danh sách điểm phản ánh dạng chuẩn GeoJSON RFC 7946 (Root FeatureCollection)
   */
  getPetitionsGeoJson: async (params?: GisFilterParams): Promise<GeoJsonFeatureCollection> => {
    const res = await axiosClient.get<GeoJsonFeatureCollection>('/gis/petitions-geojson', {
      params,
    });
    return res.data;
  },

  /**
   * Truy vấn điểm phản ánh xung quanh vị trí tâm theo bán kính không gian
   */
  getPetitionsByRadius: async (
    centerLat: number,
    centerLng: number,
    radiusKm: number = 10,
    categoryId?: string,
    status?: string
  ): Promise<ApiResponse<SpatialRadiusResult>> => {
    const res = await axiosClient.get<ApiResponse<SpatialRadiusResult>>('/gis/petitions-radius', {
      params: {
        centerLat,
        centerLng,
        radiusKm,
        categoryId,
        status,
      },
    });
    return res.data;
  },

  /**
   * Lấy tập dữ liệu điểm nhiệt (Heatmap) phục vụ hiển thị lớp mật độ sự cố
   */
  getHeatmapData: async (categoryId?: string, status?: string): Promise<ApiResponse<HeatmapData>> => {
    const res = await axiosClient.get<ApiResponse<HeatmapData>>('/gis/heatmap', {
      params: {
        categoryId,
        status,
      },
    });
    return res.data;
  },

  /**
   * Lấy dữ liệu tổng hợp mật độ phản ánh theo địa bàn huyện/thị xã tỉnh Cà Mau
   */
  getSpatialSummary: async (): Promise<ApiResponse<SpatialSummary>> => {
    const res = await axiosClient.get<ApiResponse<SpatialSummary>>('/gis/spatial-summary');
    return res.data;
  },
};
