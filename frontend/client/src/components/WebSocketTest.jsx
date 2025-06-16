import React, { useState, useEffect, useRef } from "react";
import websocketService from "../services/websocketService";
import { toast } from "react-toastify";

const WebSocketTest = ({ ticketId }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [testMessages, setTestMessages] = useState([]);
  const [testMessage, setTestMessage] = useState("");
  const lastTypingTimeRef = useRef(0);
  const typingThrottle = 3000;

  useEffect(() => {
    if (ticketId) {
      connectWebSocket();
    }

    return () => {
      websocketService.disconnect();
    };
  }, [ticketId]);

  const connectWebSocket = async () => {
    try {
      const token = localStorage.getItem("Token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      await websocketService.connect(ticketId, token);
      setIsConnected(true);

      // Set up event listeners
      websocketService.on("message", handleTestMessage);
      websocketService.on("typing", handleTestTyping);

      toast.success("WebSocket connected for testing");
    } catch (error) {
      console.error("WebSocket connection failed:", error);
      toast.error("WebSocket connection failed");
    }
  };

  const handleTestMessage = (data) => {
    setTestMessages((prev) => [
      ...prev,
      {
        type: "message",
        content: data.message?.content || "Test message received",
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const handleTestTyping = (data) => {
    setTestMessages((prev) => [
      ...prev,
      {
        type: "typing",
        content: `${data.username} is typing...`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const sendTestMessage = () => {
    if (!testMessage.trim()) return;

    websocketService.sendMessage(testMessage);
    setTestMessages((prev) => [
      ...prev,
      {
        type: "sent",
        content: testMessage,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
    setTestMessage("");
  };

  const sendTypingTest = () => {
    const now = Date.now();
    if (now - lastTypingTimeRef.current > typingThrottle) {
      websocketService.sendTyping();
      lastTypingTimeRef.current = now;
      setTestMessages((prev) => [
        ...prev,
        {
          type: "typing",
          content: "Typing indicator sent",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } else {
      setTestMessages((prev) => [
        ...prev,
        {
          type: "info",
          content: "Typing indicator throttled (wait 3 seconds)",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }
  };

  return (
    <div className="card card-enhanced p-4 mb-4">
      <h3 className="terminal-text text-lg mb-4">WebSocket Test Panel</h3>

      <div className="flex items-center gap-4 mb-4">
        <div
          className={`w-3 h-3 rounded-full ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
        ></div>
        <span className="text-sm">
          Status: {isConnected ? "Connected" : "Disconnected"}
        </span>
        <button
          onClick={connectWebSocket}
          className="filter-button active scale-on-hover text-sm px-3 py-1"
        >
          Reconnect
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Test message..."
            className="flex-1 px-3 py-2 bg-tertiary-bg border border-border-color rounded-md text-text-primary"
            onKeyPress={(e) => e.key === "Enter" && sendTestMessage()}
          />
          <button
            onClick={sendTestMessage}
            className="filter-button active scale-on-hover px-4 py-2"
          >
            Send
          </button>
          <button
            onClick={sendTypingTest}
            className="filter-button scale-on-hover px-4 py-2"
          >
            Typing
          </button>
        </div>

        <div className="max-h-32 overflow-y-auto bg-tertiary-bg p-3 rounded-md">
          <h4 className="text-sm font-medium mb-2">Test Messages:</h4>
          {testMessages.length === 0 ? (
            <p className="text-muted text-sm">No test messages yet</p>
          ) : (
            <div className="space-y-1">
              {testMessages &&
                Array.isArray(testMessages) &&
                testMessages.map((msg, index) => (
                  <div key={index} className="text-xs">
                    <span className="text-muted">[{msg.timestamp}]</span>
                    <span
                      className={`ml-2 ${
                        msg.type === "sent"
                          ? "text-blue-400"
                          : msg.type === "typing"
                          ? "text-yellow-400"
                          : msg.type === "info"
                          ? "text-gray-400"
                          : "text-green-400"
                      }`}
                    >
                      {msg.content}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebSocketTest;
