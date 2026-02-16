/**
 * WebSocket Manager for Mind Matrix
 * Handles connection, reconnection, and message handling
 */

export class WebSocketManager {
  constructor(url, onMessage, onError, onStatusChange) {
    this.url = url;
    this.onMessage = onMessage;
    this.onError = onError;
    this.onStatusChange = onStatusChange;
    
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.isIntentionallyClosed = false;
    this.pingInterval = null;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      this.ws = new WebSocket(this.url);
      this.onStatusChange?.('connecting');

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.onStatusChange?.('connected');
        
        // Start ping/pong for connection health
        this.startPingInterval();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle ping messages
          if (data.type === 'ping') {
            // Server is alive, no action needed
            return;
          }
          
          this.onMessage?.(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          this.onError?.('Failed to parse message from server');
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.onStatusChange?.('error');
        this.onError?.('Connection error occurred');
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        this.onStatusChange?.('disconnected');
        this.stopPingInterval();
        
        if (!this.isIntentionallyClosed) {
          this.handleReconnect();
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.onError?.('Failed to establish connection');
      this.handleReconnect();
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.onStatusChange?.('failed');
      this.onError?.('Unable to connect to server. Please refresh the page.');
      return;
    }

    this.reconnectAttempts++;
    this.onStatusChange?.('reconnecting');
    
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.isIntentionallyClosed) {
        this.connect();
      }
    }, delay);
  }

  startPingInterval() {
    // Client doesn't need to send pings, server handles it
    // This is just for tracking last received message
  }

  stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  send(message) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message);
      return true;
    } else {
      console.error('WebSocket is not connected');
      this.onError?.('Cannot send message: not connected');
      return false;
    }
  }

  close() {
    this.isIntentionallyClosed = true;
    this.stopPingInterval();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  getStatus() {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'disconnecting';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }
}
