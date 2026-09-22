import axiosClient from './axiosClient';

/**
 * Kích hoạt tải file từ blob response
 */
function triggerBlobDownload(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export const reportsApi = {
  /**
   * Xuất danh sách phản ánh kiến nghị ra file Excel (.xlsx)
   */
  async exportPetitionsExcel(params?: {
    startDate?: string;
    endDate?: string;
    departmentId?: string;
    status?: string;
  }): Promise<void> {
    const response = await axiosClient.get('/reports/petitions/excel', {
      params,
      responseType: 'blob',
    });

    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fileName = `BaoCao_PhanAnh_${timestamp}.xlsx`;
    triggerBlobDownload(response.data as Blob, fileName);
  },

  /**
   * Xuất báo cáo KPI tổng hợp ra file PDF
   */
  async exportKpiPdf(days: number, departmentId?: string): Promise<void> {
    const response = await axiosClient.get('/reports/kpi/pdf', {
      params: { days, departmentId: departmentId || undefined },
      responseType: 'blob',
    });

    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fileName = `BaoCao_KPI_${days}ngay_${timestamp}.pdf`;
    triggerBlobDownload(response.data as Blob, fileName);
  },
};
