import * as L from 'leaflet';

declare module 'leaflet' {
  export interface HeatLatLngTuple extends Array<number> {
    0: number; // lat
    1: number; // lng
    2?: number; // intensity/weight
  }

  export interface HeatMapOptions {
    minOpacity?: number;
    maxZoom?: number;
    max?: number;
    radius?: number;
    blur?: number;
    gradient?: { [key: number]: string };
  }

  export function heatLayer(
    latlngs: Array<HeatLatLngTuple | [number, number] | [number, number, number]>,
    options?: HeatMapOptions
  ): HeatLayer;

  export interface HeatLayer extends L.Layer {
    setLatLngs(latlngs: Array<HeatLatLngTuple | [number, number] | [number, number, number]>): this;
    addLatLng(latlng: HeatLatLngTuple | [number, number] | [number, number, number]): this;
    setOptions(options: HeatMapOptions): this;
    redraw(): this;
  }
}
