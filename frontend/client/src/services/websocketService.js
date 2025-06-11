class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
    this.lastTypingTime = 0;
    this.typingThrottle = 1000; // 1 second between typing indicators (reduced from 2)
    this.isConnecting = false;
    this.manualDisconnect = false;
  }

  connect(ticketId, token) {
    return new Promise((resolve, reject) => {
      try {
        // Prevent multiple simultaneous connection attempts
        if (this.isConnecting) {
          console.log("Connection already in progress");
          return;
        }

        // If already connected, just resolve
        if (this.isConnected()) {
          console.log("Already connected");
          resolve();
          return;
        }

        this.isConnecting = true;
        this.manualDisconnect = false;

        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = window.location.host;
        const wsUrl = `${protocol}//${host}/ws/tickets/${ticketId}/?token=${token}`;

        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          console.log("WebSocket connected");
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        this.socket.onclose = (event) => {
          console.log("WebSocket disconnected:", event.code, event.reason);
          this.isConnecting = false;
          if (!this.manualDisconnect) {
            this.handleDisconnect();
          }
        };

        this.socket.onerror = (error) => {
          console.error("WebSocket error:", error);
          this.isConnecting = false;
          reject(error);
        };
      } catch (error) {
        console.error("Error creating WebSocket connection:", error);
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect() {
    this.manualDisconnect = true;
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.listeners.clear();
    this.isConnecting = false;
  }

  sendMessage(content) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = {
        type: "message",
        content: content,
      };
      this.socket.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected");
    }
  }

  sendTyping() {
    const now = Date.now();
    if (now - this.lastTypingTime > this.typingThrottle) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        const message = {
          type: "typing",
        };
        this.socket.send(JSON.stringify(message));
        this.lastTypingTime = now;
      }
    }
  }

  handleMessage(data) {
    const { type } = data;

    if (this.listeners.has(type)) {
      this.listeners.get(type).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error("Error in message listener:", error);
        }
      });
    }
  }

  handleDisconnect() {
    if (this.manualDisconnect) {
      return; // Don't reconnect if manually disconnected
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      setTimeout(() => {
        // Try to reconnect if we have the ticket ID and token
        if (this.lastTicketId && this.lastToken && !this.manualDisconnect) {
          this.connect(this.lastTicketId, this.lastToken).catch((error) => {
            console.error("Reconnection failed:", error);
          });
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error("Max reconnection attempts reached");
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Store connection details for reconnection
  setConnectionDetails(ticketId, token) {
    this.lastTicketId = ticketId;
    this.lastToken = token;
  }

  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();
export default websocketService;
