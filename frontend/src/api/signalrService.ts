import * as signalR from '@microsoft/signalr';
import type { NotificationItem } from '../types/notification';

type NotificationCallback = (notification: NotificationItem) => void;
type PetitionEventCallback = (data: unknown) => void;

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private isConnecting = false;
  private notificationListeners: NotificationCallback[] = [];
  private petitionCreatedListeners: PetitionEventCallback[] = [];
  private petitionStatusChangedListeners: PetitionEventCallback[] = [];
  private petitionResolvedListeners: PetitionEventCallback[] = [];
  private newCommentListeners: PetitionEventCallback[] = [];

  /**
   * Khởi tạo và mở kết nối WebSocket tới NotificationHub
   */
  public async startConnection(): Promise<void> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return;
    }

    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    if (this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl('/hubs/notification', {
          accessTokenFactory: () => localStorage.getItem('access_token') || '',
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Đăng ký nhận thông báo chung
      this.connection.on('ReceiveNotification', (notification: NotificationItem) => {
        this.notificationListeners.forEach((cb) => cb(notification));
      });

      // Đăng ký nhận sự kiện có đơn mới
      this.connection.on('PetitionCreated', (data: unknown) => {
        this.petitionCreatedListeners.forEach((cb) => cb(data));
      });

      // Đăng ký nhận sự kiện chuyển trạng thái
      this.connection.on('PetitionStatusChanged', (data: unknown) => {
        this.petitionStatusChangedListeners.forEach((cb) => cb(data));
      });

      // Đăng ký nhận sự kiện kết luận giải quyết
      this.connection.on('PetitionResolved', (data: unknown) => {
        this.petitionResolvedListeners.forEach((cb) => cb(data));
      });

      // Đăng ký nhận sự kiện ý kiến mới
      this.connection.on('NewCommentAdded', (data: unknown) => {
        this.newCommentListeners.forEach((cb) => cb(data));
      });

      await this.connection.start();
      console.log('SignalR: Kết nối thành công tới NotificationHub');
    } catch (error) {
      console.warn('SignalR: Không thể kết nối tới Hub. Sẽ tự thử lại khi có thao tác.', error);
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Ngắt kết nối khi đăng xuất
   */
  public async stopConnection(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log('SignalR: Đã ngắt kết nối');
      } catch (error) {
        console.error('SignalR: Lỗi khi ngắt kết nối', error);
      } finally {
        this.connection = null;
      }
    }
  }

  // --- Quản lý Subscriber callbacks ---
  public onNotification(callback: NotificationCallback): () => void {
    this.notificationListeners.push(callback);
    return () => {
      this.notificationListeners = this.notificationListeners.filter((cb) => cb !== callback);
    };
  }

  public onPetitionCreated(callback: PetitionEventCallback): () => void {
    this.petitionCreatedListeners.push(callback);
    return () => {
      this.petitionCreatedListeners = this.petitionCreatedListeners.filter((cb) => cb !== callback);
    };
  }

  public onPetitionStatusChanged(callback: PetitionEventCallback): () => void {
    this.petitionStatusChangedListeners.push(callback);
    return () => {
      this.petitionStatusChangedListeners = this.petitionStatusChangedListeners.filter((cb) => cb !== callback);
    };
  }

  public onPetitionResolved(callback: PetitionEventCallback): () => void {
    this.petitionResolvedListeners.push(callback);
    return () => {
      this.petitionResolvedListeners = this.petitionResolvedListeners.filter((cb) => cb !== callback);
    };
  }

  public onNewCommentAdded(callback: PetitionEventCallback): () => void {
    this.newCommentListeners.push(callback);
    return () => {
      this.newCommentListeners = this.newCommentListeners.filter((cb) => cb !== callback);
    };
  }
}

export const signalRService = new SignalRService();
