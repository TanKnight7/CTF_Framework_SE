import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getTicket,
  getAllMessages,
  createMessage,
  closeTicket,
  getProfile,
} from "../services/apiCTF";
import websocketService from "../services/websocketService";
import { toast } from "react-toastify";

const TicketChat = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastTypingTimeRef = useRef(0);
  const typingThrottle = 1000;
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (ticketId) {
      fetchTicketData();
      fetchCurrentUser();
      connectWebSocket();
    }

    return () => {
      websocketService.disconnect();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [ticketId]);

  useEffect(() => {
    scrollToTop();
  }, [messages]);

  useEffect(() => {
    if (newMessage.length > 0) {
      scrollToTop();
    }
  }, [newMessage]);

  const scrollToTop = () => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        const messagesContainer = chatContainerRef.current;
        messagesContainer.scrollTop = 0;
      }
    }, 100);
  };

  const connectWebSocket = async () => {
    try {
      if (websocketService.isConnected()) {
        setIsConnected(true);
        return;
      }

      const token = localStorage.getItem("Token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      await websocketService.connect(ticketId, token);
      setIsConnected(true);

      websocketService.on("message", handleNewMessage);
      websocketService.on("typing", handleUserTyping);
      websocketService.on("clear_typing", handleClearTyping);

      websocketService.setConnectionDetails(ticketId, token);
    } catch (error) {
      console.error("Failed to connect to WebSocket:", error);
    }
  };

  const handleNewMessage = (data) => {
    const { message } = data;
    if (message) {
      setMessages((prev) => {
        const messageExists = prev.some(
          (existingMessage) => existingMessage.id === message.id
        );
        if (messageExists) {
          return prev;
        }
        return [message, ...prev];
      });
      setTicket((prev) =>
        prev ? { ...prev, last_updated: message.sent_time } : prev
      );
      toast.success("New message received");
    }
  };

  const handleUserTyping = (data) => {
    const { username } = data;
    if (username && username !== currentUser?.username) {
      setTypingUsers((prev) => new Set([...prev, username]));

      setTimeout(() => {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(username);
          return newSet;
        });
      }, 8000);
    }
  };

  const handleClearTyping = (data) => {
    const { username } = data;
    setTypingUsers((prev) => {
      const newSet = new Set(prev);
      newSet.delete(username);
      return newSet;
    });
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await getProfile();
      if (response && !response.error) {
        setCurrentUser(response);
      }
    } catch (err) {
      console.error("Failed to fetch current user:", err);
    }
  };

  const fetchTicketData = async () => {
    try {
      setLoading(true);
      setError(null);

      const ticketResponse = await getTicket(ticketId);
      if (ticketResponse.error) {
        setError(ticketResponse.error);
        toast.error(ticketResponse.error);
        return;
      }
      setTicket(ticketResponse);

      const messagesResponse = await getAllMessages(ticketId);
      if (messagesResponse.error) {
        setError(messagesResponse.error);
        toast.error(messagesResponse.error);
        return;
      }
      setMessages(messagesResponse.reverse());
    } catch (err) {
      setError("Failed to fetch ticket data");
      toast.error("Failed to fetch ticket data");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !ticket || sending) return;

    try {
      setSending(true);

      if (currentUser?.username) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(currentUser.username);
          return newSet;
        });
      }

      if (websocketService.isConnected()) {
        websocketService.sendMessage(newMessage.trim());
        setNewMessage("");
        return;
      }

      const response = await createMessage(ticketId, {
        content: newMessage.trim(),
      });

      if (response.error) {
        toast.error(response.error);
        return;
      }

      setMessages((prev) => [response, ...prev]);
      setNewMessage("");
      toast.success("Message sent successfully");
      fetchTicketData();
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    const now = Date.now();
    if (now - lastTypingTimeRef.current > typingThrottle) {
      if (websocketService.isConnected()) {
        websocketService.sendTyping();
        lastTypingTimeRef.current = now;
      }
    }
  };

  const handleCloseTicket = async () => {
    if (!ticket || closing) return;

    try {
      setClosing(true);
      const response = await closeTicket(ticketId);

      if (response.error) {
        toast.error(response.error);
        return;
      }

      toast.success("Ticket closed successfully");
      setTicket(response);
    } catch (err) {
      toast.error("Failed to close ticket");
    } finally {
      setClosing(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return (
        date.toLocaleDateString() +
        " " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    }
  };

  const isCurrentUserMessage = (message) => {
    return currentUser && message.author_username === currentUser.username;
  };

  const getStatusClass = (status) => {
    return status?.toLowerCase() === "open"
      ? "ticket-status-open"
      : "ticket-status-closed";
  };

  if (loading) {
    return (
      <div className="container relative z-10">
        <div className="flex justify-center items-center h-64">
          <div className="terminal-text pulse">Loading ticket...</div>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="container relative z-10">
        <h1 className="terminal-text text-3xl mb-6 main-title-glow">
          Ticket Not Found
        </h1>
        <p className="text-muted">
          Could not find ticket with ID: {ticketId || "N/A"}
        </p>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        <button
          onClick={() => navigate("/tickets")}
          className="filter-button active mt-4 scale-on-hover"
        >
          Back to Tickets
        </button>
      </div>
    );
  }

  return (
    <div className="page-container relative">
      {/* Animated Background */}
      <div className="animated-bg"></div>

      <div className="container relative z-10">
        {/* Header Card */}
        <div className="chat-header card card-enhanced p-6 mb-6">
          <div className="ticket-header-content">
            {/* Left Section - Ticket Info */}
            <div className="ticket-info-section">
              <div className="ticket-title-section">
                <div className="ticket-icon">
                  <span className="ticket-icon-text">🎫</span>
                </div>
                <div className="ticket-title">
                  <h1 className="terminal-text text-3xl main-title-glow mb-2">
                    TICKET-{ticket.ticket_id}
                  </h1>
                  <div className="ticket-badge">
                    <span className={getStatusClass(ticket.status)}>
                      {ticket.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="ticket-details">
                <div className="detail-row">
                  <div className="detail-item">
                    <span className="detail-label">Challenge</span>
                    <span className="detail-value challenge-name">
                      {ticket.challenge_name}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Created by</span>
                    <span className="detail-value creator-name">
                      {ticket.created_by_username}
                    </span>
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-item">
                    <span className="detail-label">Last Updated</span>
                    <span className="detail-value last-updated">
                      {formatTime(ticket.last_updated)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Connection</span>
                    <div className="connection-status">
                      <div
                        className={`status-dot ${
                          isConnected ? "connected" : "disconnected"
                        }`}
                      ></div>
                      <span className="status-text">
                        {isConnected ? "CONNECTED" : "DISCONNECTED"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Actions */}
            <div className="ticket-actions">
              {ticket.status === "open" && (
                <button
                  onClick={handleCloseTicket}
                  disabled={closing}
                  className="close-ticket-button"
                >
                  <div className="button-content">
                    <span className="button-icon">🔒</span>
                    <span className="button-text">
                      {closing ? "CLOSING..." : "CLOSE TICKET"}
                    </span>
                  </div>
                  <div className="button-glow"></div>
                </button>
              )}

              <button
                onClick={() => navigate("/tickets")}
                className="back-tickets-button"
              >
                <div className="button-content">
                  <span className="button-icon">←</span>
                  <span className="button-text">BACK TO TICKETS</span>
                </div>
                <div className="button-glow"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="card card-enhanced p-6 chat-container">
          {/* Messages Area */}
          <div
            ref={chatContainerRef}
            className="chat-messages"
            style={{
              height: "65vh",
              overflowY: "auto",
            }}
          >
            {messages.length > 0 ? (
              <div className="messages-container">
                {/* Typing Indicator */}
                {typingUsers.size > 0 && (
                  <div className="chat-message chat-message-setter typing-indicator">
                    <div className="typing-content">
                      <div className="typing-avatar">
                        <div className="typing-dots">
                          <div className="dot"></div>
                          <div className="dot"></div>
                          <div className="dot"></div>
                        </div>
                      </div>
                      <div className="typing-text">
                        <p className="typing-message">
                          {Array.from(typingUsers).join(", ")} is typing...
                        </p>
                        <span className="typing-time">Just now</span>
                      </div>
                    </div>
                  </div>
                )}

                {messages.map((message, index) => {
                  const isCurrentUser = isCurrentUserMessage(message);
                  const showDate =
                    index === 0 ||
                    new Date(message.sent_time).toDateString() !==
                      new Date(messages[index - 1].sent_time).toDateString();

                  return (
                    <div key={message.id} className="message-wrapper">
                      {showDate && (
                        <div className="date-separator">
                          <span>
                            {new Date(message.sent_time).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div
                        className={`chat-message ${
                          isCurrentUser
                            ? "chat-message-user"
                            : "chat-message-setter"
                        }`}
                      >
                        <div className="message-content">
                          <p>{message.content}</p>
                        </div>
                        <div className="message-meta">
                          <span className="sender">
                            {isCurrentUser ? "You" : message.author_username}
                          </span>
                          <span className="time">
                            {formatTime(message.sent_time)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="empty-chat-icon">
                  <div className="text-6xl mb-4">💬</div>
                </div>
                <h3 className="text-terminal-green text-2xl font-bold mb-2 main-title-glow">
                  NO MESSAGES YET
                </h3>
                <p className="text-muted text-lg max-w-md">
                  Begin the conversation by sending your first message below
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="chat-input-area">
            <div className="input-container">
              <textarea
                ref={inputRef}
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                placeholder="Type your message here..."
                className="chat-textarea"
                rows="1"
                disabled={sending || ticket.status === "closed"}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <button
                type="submit"
                className="chat-send-button"
                disabled={
                  !newMessage.trim() || sending || ticket.status === "closed"
                }
              >
                <span className="button-text">
                  {sending ? "SENDING..." : "SEND"}
                </span>
                <div className="button-glow"></div>
              </button>
            </div>

            {ticket.status === "closed" && (
              <div className="closed-warning">
                <span className="warning-icon">⚠️</span>
                <span>TICKET IS CLOSED - NO NEW MESSAGES CAN BE SENT</span>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Custom CSS for enhanced styling */}
      <style jsx>{`
        .animated-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(
              circle at 20% 80%,
              rgba(0, 255, 0, 0.1) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 80% 20%,
              rgba(0, 136, 255, 0.1) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 40% 40%,
              rgba(187, 0, 255, 0.05) 0%,
              transparent 50%
            );
          animation: bgFloat 20s ease-in-out infinite;
          z-index: 0;
          pointer-events: none;
        }

        @keyframes bgFloat {
          0%,
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(-10px, -10px) rotate(1deg);
          }
          50% {
            transform: translate(10px, -5px) rotate(-1deg);
          }
          75% {
            transform: translate(-5px, 10px) rotate(0.5deg);
          }
        }

        .chat-container {
          background: linear-gradient(
            135deg,
            var(--secondary-bg) 0%,
            var(--tertiary-bg) 100%
          );
          border: 2px solid var(--terminal-green);
          box-shadow: 0 0 30px rgba(0, 255, 0, 0.2),
            inset 0 0 30px rgba(0, 255, 0, 0.05);
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .chat-container::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            var(--terminal-green),
            transparent
          );
          animation: scanLine 3s linear infinite;
        }

        @keyframes scanLine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .chat-messages {
          scrollbar-width: thin;
          scrollbar-color: var(--terminal-green) var(--secondary-bg);
          display: flex;
          flex-direction: column-reverse;
          position: relative;
        }

        .messages-container {
          display: flex;
          flex-direction: column-reverse;
          min-height: 100%;
        }

        .chat-messages::-webkit-scrollbar {
          width: 8px;
        }

        .chat-messages::-webkit-scrollbar-track {
          background: var(--secondary-bg);
          border-radius: 4px;
        }

        .chat-messages::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, var(--terminal-green), #00cc00);
          border-radius: 4px;
          border: 1px solid var(--terminal-green);
        }

        .chat-messages::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #00cc00, var(--terminal-green));
        }

        .message-wrapper {
          margin-bottom: 1.5rem;
        }

        .date-separator {
          text-align: center;
          margin: 2rem 0 1rem 0;
          position: relative;
        }

        .date-separator::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            var(--terminal-green),
            transparent
          );
        }

        .date-separator span {
          background: var(--secondary-bg);
          padding: 0.5rem 1rem;
          border: 1px solid var(--terminal-green);
          border-radius: 20px;
          color: var(--terminal-green);
          font-size: 0.75rem;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .chat-message {
          padding: 1rem;
          border-radius: 12px;
          position: relative;
          animation: messageSlideIn 0.4s ease-out;
          backdrop-filter: blur(5px);
          transition: all 0.3s ease;
        }

        .chat-message:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .chat-message-user {
          background: linear-gradient(
            135deg,
            rgba(0, 255, 0, 0.1) 0%,
            rgba(0, 255, 0, 0.05) 100%
          );
          border: 2px solid var(--terminal-green);
          margin-left: 3rem;
          box-shadow: 0 4px 15px rgba(0, 255, 0, 0.2);
        }

        .chat-message-setter {
          background: linear-gradient(
            135deg,
            rgba(0, 136, 255, 0.1) 0%,
            rgba(0, 136, 255, 0.05) 100%
          );
          border: 2px solid var(--accent-blue);
          margin-right: 3rem;
          box-shadow: 0 4px 15px rgba(0, 136, 255, 0.2);
        }

        .typing-indicator {
          background: linear-gradient(
            135deg,
            rgba(187, 0, 255, 0.1) 0%,
            rgba(187, 0, 255, 0.05) 100%
          );
          border: 2px solid var(--accent-purple);
          box-shadow: 0 4px 15px rgba(187, 0, 255, 0.2);
          margin-right: 3rem;
        }

        .typing-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .typing-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            var(--accent-purple) 0%,
            #8b00ff 100%
          );
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--accent-purple);
          box-shadow: 0 2px 10px rgba(187, 0, 255, 0.3);
          animation: typingPulse 2s ease-in-out infinite;
        }

        @keyframes typingPulse {
          0%,
          100% {
            transform: scale(1);
            box-shadow: 0 2px 10px rgba(187, 0, 255, 0.3);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 4px 20px rgba(187, 0, 255, 0.5);
          }
        }

        .typing-text {
          flex: 1;
        }

        .typing-message {
          margin: 0;
          color: var(--accent-purple);
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .typing-time {
          display: block;
          color: var(--text-muted);
          font-size: 0.75rem;
          margin-top: 0.25rem;
          font-family: "Courier New", monospace;
        }

        .typing-dots {
          display: flex;
          gap: 3px;
        }

        .typing-dots .dot {
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
          animation: typingBounce 1.4s infinite ease-in-out;
          box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
        }

        .typing-dots .dot:nth-child(1) {
          animation-delay: -0.32s;
        }
        .typing-dots .dot:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes typingBounce {
          0%,
          80%,
          100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes messageSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .ticket-status-open {
          background: linear-gradient(
            135deg,
            rgba(0, 255, 0, 0.2) 0%,
            rgba(0, 255, 0, 0.1) 100%
          );
          color: var(--terminal-green);
          border: 2px solid var(--terminal-green);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 4px 15px rgba(0, 255, 0, 0.2);
        }

        .ticket-status-closed {
          background: linear-gradient(
            135deg,
            rgba(255, 0, 85, 0.2) 0%,
            rgba(255, 0, 85, 0.1) 100%
          );
          color: var(--accent-red);
          border: 2px solid var(--accent-red);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 4px 15px rgba(255, 0, 85, 0.2);
        }

        .message-content p {
          margin: 0;
          line-height: 1.6;
          color: var(--text-primary);
        }

        .message-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 0.75rem;
          padding-top: 0.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 0.75rem;
        }

        .sender {
          color: var(--terminal-green);
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .time {
          color: var(--text-muted);
          font-family: "Courier New", monospace;
        }

        .chat-input-area {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 2px solid var(--terminal-green);
          position: relative;
        }

        .chat-input-area::before {
          content: "";
          position: absolute;
          top: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            var(--terminal-green),
            transparent
          );
          animation: inputGlow 2s ease-in-out infinite;
        }

        @keyframes inputGlow {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        .input-container {
          display: flex;
          gap: 1rem;
          align-items: flex-end;
        }

        .chat-textarea {
          flex: 1;
          background: linear-gradient(
            135deg,
            var(--primary-bg) 0%,
            var(--secondary-bg) 100%
          );
          border: 2px solid var(--terminal-green);
          border-radius: 8px;
          padding: 1rem;
          color: var(--terminal-green);
          font-family: "Courier New", monospace;
          font-size: 1rem;
          resize: vertical;
          min-height: 50px;
          max-height: 150px;
          outline: none;
          transition: all 0.3s ease;
          box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .chat-textarea:focus {
          border-color: #00cc00;
          box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.3),
            0 0 20px rgba(0, 255, 0, 0.3);
          background: linear-gradient(
            135deg,
            var(--secondary-bg) 0%,
            var(--tertiary-bg) 100%
          );
          transform: translateY(-1px);
        }

        .chat-textarea::placeholder {
          color: var(--text-muted);
          opacity: 0.7;
        }

        .chat-textarea:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          border-color: var(--border-color);
        }

        .chat-send-button {
          position: relative;
          padding: 1rem 2rem;
          background: linear-gradient(
            135deg,
            var(--terminal-green) 0%,
            #00cc00 100%
          );
          color: var(--terminal-black);
          border: none;
          border-radius: 8px;
          font-weight: bold;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          overflow: hidden;
          min-width: 120px;
        }

        .chat-send-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 255, 0, 0.4);
        }

        .chat-send-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .chat-send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .button-text {
          position: relative;
          z-index: 2;
        }

        .button-glow {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          transition: left 0.5s ease;
        }

        .chat-send-button:hover .button-glow {
          left: 100%;
        }

        .closed-warning {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1rem;
          padding: 1rem;
          background: linear-gradient(
            135deg,
            rgba(255, 0, 85, 0.1) 0%,
            rgba(255, 0, 85, 0.05) 100%
          );
          border: 2px solid var(--accent-red);
          border-radius: 8px;
          color: var(--accent-red);
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          animation: warningPulse 2s ease-in-out infinite;
        }

        @keyframes warningPulse {
          0%,
          100% {
            box-shadow: 0 0 10px rgba(255, 0, 85, 0.3);
          }
          50% {
            box-shadow: 0 0 20px rgba(255, 0, 85, 0.5);
          }
        }

        .warning-icon {
          font-size: 1.2rem;
        }

        .back-button {
          background: linear-gradient(
            135deg,
            var(--secondary-bg) 0%,
            var(--tertiary-bg) 100%
          );
          border: 2px solid var(--terminal-green);
          color: var(--terminal-green);
          padding: 1rem 2rem;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .back-button:hover {
          background: var(--terminal-green);
          color: var(--terminal-black);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 255, 0, 0.3);
        }

        .empty-chat-icon {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .main-title-glow {
          text-shadow: 0 0 20px var(--terminal-green);
        }

        .ticket-header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 2rem;
        }

        .ticket-info-section {
          flex: 1;
        }

        .ticket-title-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .ticket-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            var(--terminal-green) 0%,
            #00cc00 100%
          );
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid var(--terminal-green);
          box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
          animation: iconPulse 3s ease-in-out infinite;
        }

        @keyframes iconPulse {
          0%,
          100% {
            transform: scale(1);
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 30px rgba(0, 255, 0, 0.5);
          }
        }

        .ticket-icon-text {
          font-size: 2rem;
          filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.5));
        }

        .ticket-title {
          flex: 1;
        }

        .ticket-badge {
          margin-top: 0.5rem;
        }

        .ticket-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .detail-row {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }

        .detail-value {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .challenge-name {
          color: var(--terminal-green);
          text-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
        }

        .creator-name {
          color: var(--accent-blue);
          text-shadow: 0 0 10px rgba(0, 136, 255, 0.3);
        }

        .last-updated {
          color: var(--text-muted);
          font-family: "Courier New", monospace;
          font-size: 0.9rem;
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          animation: statusPulse 2s ease-in-out infinite;
        }

        .status-dot.connected {
          background: var(--terminal-green);
          box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
        }

        .status-dot.disconnected {
          background: var(--accent-red);
          box-shadow: 0 0 10px rgba(255, 0, 85, 0.5);
        }

        @keyframes statusPulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.8;
          }
        }

        .status-text {
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-family: "Courier New", monospace;
        }

        .ticket-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          min-width: 200px;
        }

        .close-ticket-button,
        .back-tickets-button {
          position: relative;
          padding: 1rem 1.5rem;
          border: none;
          border-radius: 12px;
          font-weight: bold;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          overflow: hidden;
          text-transform: uppercase;
          letter-spacing: 1px;
          min-height: 50px;
        }

        .close-ticket-button {
          background: linear-gradient(
            135deg,
            var(--accent-red) 0%,
            #cc0044 100%
          );
          color: white;
          border: 2px solid var(--accent-red);
        }

        .close-ticket-button:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(255, 0, 85, 0.4);
          border-color: #ff1a75;
        }

        .back-tickets-button {
          background: linear-gradient(
            135deg,
            var(--secondary-bg) 0%,
            var(--tertiary-bg) 100%
          );
          color: var(--terminal-green);
          border: 2px solid var(--terminal-green);
        }

        .back-tickets-button:hover {
          background: var(--terminal-green);
          color: var(--terminal-black);
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0, 255, 0, 0.4);
        }

        .button-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          position: relative;
          z-index: 2;
        }

        .button-icon {
          font-size: 1.2rem;
          filter: drop-shadow(0 0 3px rgba(0, 0, 0, 0.3));
        }

        .button-text {
          font-weight: 700;
        }

        .button-glow {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          transition: left 0.6s ease;
        }

        .close-ticket-button:hover .button-glow,
        .back-tickets-button:hover .button-glow {
          left: 100%;
        }

        .close-ticket-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .close-ticket-button:disabled:hover {
          transform: none;
          box-shadow: none;
        }
      `}</style>
    </div>
  );
};

export default TicketChat;
