import React, { useState, useEffect, useRef } from "react";
// import { useParams } from "react-router-dom"; // Assuming React Router is used

// --- Mock Data Embedded ---
const mockTickets = [
  {
    ticketId: "TKT-001",
    status: "Open",
    challengeId: "chal1",
    challengeName: "Login Bypass",
    subject: "Hint needed for stage 2",
    user: "cyberNinja",
    problemSetter: "admin",
    lastUpdated: "2024-05-29T10:30:00Z",
    messages: [
      {
        sender: "cyberNinja",
        timestamp: "2024-05-29T10:30:00Z",
        text: "I'm stuck on the second part of the login bypass, any hints?",
      },
      {
        sender: "admin",
        timestamp: "2024-05-29T10:35:00Z",
        text: "Have you considered how the application handles session cookies?",
      },
    ],
  },
  {
    ticketId: "TKT-002",
    status: "Closed",
    challengeId: "chal2",
    challengeName: "Caesar Cipher Advanced",
    subject: "Issue with decryption key",
    user: "rootKit",
    problemSetter: "admin",
    lastUpdated: "2024-05-28T15:00:00Z",
    messages: [
      {
        sender: "rootKit",
        timestamp: "2024-05-28T14:55:00Z",
        text: "The provided key doesn't seem to work.",
      },
      {
        sender: "admin",
        timestamp: "2024-05-28T15:00:00Z",
        text: "Apologies, there was a typo in the challenge description. It has been corrected. Please try again.",
      },
    ],
  },
  {
    ticketId: "TKT-003",
    status: "Open",
    challengeId: "chal4",
    challengeName: "Beginner Reversing",
    subject: "Understanding assembly instructions",
    user: "pwn3r",
    problemSetter: "admin",
    lastUpdated: "2024-05-29T16:45:00Z",
    messages: [
      {
        sender: "pwn3r",
        timestamp: "2024-05-29T16:45:00Z",
        text: "Can you explain what the `jmp` instruction does here?",
      },
    ],
  },
];
// --- End Mock Data ---

// Mock useParams for environments where React Router might not be fully set up for testing
// In a real app, you'd use: import { useParams } from "react-router-dom";
const useParams = () => {
  // Simulate getting ticketId from URL, e.g., /tickets/TKT-001
  const pathParts = window.location.pathname.split("/");
  const ticketIdFromPath = pathParts[pathParts.length - 1]; // Assumes ID is the last part
  console.log("Mock useParams extracted ticketId:", ticketIdFromPath);
  return { ticketId: ticketIdFromPath };
};

const TicketChat = () => {
  const { ticketId } = useParams(); // Get ticketId from URL (or mock)
  const [ticket, setTicket] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null); // Ref to scroll to bottom

  // Log initial values
  console.log(
    "Initial URL ticketId from useParams:",
    ticketId,
    "(type:",
    typeof ticketId + ")"
  );
  console.log("Initial MockTickets data:", mockTickets);

  // Find the ticket based on ticketId
  useEffect(() => {
    if (!ticketId) {
      console.warn("No ticketId found from URL parameters.");
      setTicket(null);
      return;
    }
    if (!mockTickets || mockTickets.length === 0) {
      console.warn("mockTickets array is empty or undefined.");
      setTicket(null);
      return;
    }

    console.log(`Searching for ticket with ID: '${ticketId}'`);
    const foundTicket = mockTickets.find((t) => {
      console.log(
        `Comparing provided ID '${ticketId}' (type: ${typeof ticketId}) with mock ID '${
          t.ticketId
        }' (type: ${typeof t.ticketId})`
      );
      return t.ticketId === ticketId; // Both should be strings
    });

    if (foundTicket) {
      console.log("Ticket found:", foundTicket);
      setTicket(foundTicket);
    } else {
      console.warn(`Ticket with ID '${ticketId}' not found in mockTickets.`);
      setTicket(null);
    }
  }, [ticketId]); // Only re-run if ticketId changes

  // Scroll to the bottom of the chat messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !ticket) return;

    const messageToSend = {
      sender: "currentUser", // Replace with actual logged-in user identifier
      timestamp: new Date().toISOString(),
      text: newMessage.trim(),
    };

    setTicket((prevTicket) => {
      if (!prevTicket) return null;
      const updatedMessages = prevTicket.messages
        ? [...prevTicket.messages, messageToSend]
        : [messageToSend];
      return {
        ...prevTicket,
        messages: updatedMessages,
        lastUpdated: new Date().toISOString(),
        status: "Open", // Re-open ticket if user replies? Or handle status differently.
      };
    });

    console.log("Sending message (mock):", messageToSend);
    setNewMessage("");
  };

  // Helper to get status class - reverted to original logic
  const getStatusClass = (status) => {
    return status?.toLowerCase() === "open"
      ? "ticket-status-open"
      : "ticket-status-closed";
  };

  if (!ticket) {
    return (
      // Using original class names for "Ticket Not Found"
      <div className="container relative z-10">
        <h1 className="terminal-text text-3xl mb-6 main-title-glow">
          Ticket Not Found
        </h1>
        <p className="text-muted">
          Could not find ticket with ID: {ticketId || "N/A"}
        </p>
        <p className="text-muted text-xs mt-1">
          Current URL Path (for mock useParams): {window.location.pathname}
        </p>
      </div>
    );
  }

  return (
    // Using original class names for the main container
    <div className="container relative overflow-hidden">
      {/* <div className="animated-grid-background"></div>  // Original commented-out background */}
      <div className="relative z-10">
        {/* Chat Header - using original class names */}
        <div className="chat-header card card-enhanced p-4 mb-4">
          <div className="flex justify-between items-start">
            {" "}
            {/* Assuming 'flex justify-between items-start' is acceptable or part of original implied style */}
            <div>
              <h1 className="terminal-text text-2xl main-title-glow mb-1">
                Ticket: {ticket.ticketId}
              </h1>
              <p className="text-muted text-sm">
                Challenge:{" "}
                <span className="text-text-primary">
                  {ticket.challengeName}
                </span>
              </p>
              <p className="text-muted text-sm">
                Subject:{" "}
                <span className="text-text-primary">{ticket.subject}</span>
              </p>
            </div>
            <div>
              <span className={getStatusClass(ticket.status)}>
                {ticket.status}
              </span>
              <p className="text-muted text-xs mt-1">
                Last Updated: {new Date(ticket.lastUpdated).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Chat Area - using original class names */}
        <div className="card card-enhanced p-4 chat-container">
          {/* Messages Display - using original class names */}
          <div className="chat-messages">
            {ticket.messages &&
              ticket.messages.map((msg, index) => (
                <div
                  key={msg.timestamp + index} // Using timestamp + index for a more unique key
                  className={`chat-message ${
                    msg.sender === "currentUser"
                      ? "chat-message-user"
                      : "chat-message-setter"
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="message-meta">
                    {msg.sender === "currentUser"
                      ? "You"
                      : ticket.problemSetter}{" "}
                    -{" "}
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            <div ref={messagesEndRef} /> {/* Anchor for scrolling */}
          </div>

          {/* Message Input Form - using original class names */}
          <form onSubmit={handleSendMessage} className="chat-input-area">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message here..."
              className="chat-textarea focus:border-terminal-green focus:outline-none focus:ring-1 focus:ring-terminal-green"
              rows="1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <button
              type="submit"
              className="filter-button active chat-send-button scale-on-hover"
              disabled={!newMessage.trim() || !ticket}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TicketChat;
