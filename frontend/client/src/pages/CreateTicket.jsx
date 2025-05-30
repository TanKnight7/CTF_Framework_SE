import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // Assuming React Router is used
import { mockChallenges, mockTickets } from "../data/Data"; // Import mock data

const CreateTicket = () => {
  const [challengeSearchTerm, setChallengeSearchTerm] = useState("");
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Filter challenges based on search term
  const filteredChallenges = useMemo(() => {
    if (!challengeSearchTerm) return [];
    return mockChallenges.filter((challenge) =>
      challenge.name.toLowerCase().includes(challengeSearchTerm.toLowerCase())
    );
  }, [challengeSearchTerm]);

  const handleChallengeSelect = (challenge) => {
    setSelectedChallenge(challenge);
    setChallengeSearchTerm(""); // Clear search after selection
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedChallenge || !subject || !message) {
      alert("Please select a challenge and fill in both subject and message.");
      return;
    }

    // --- Mock Ticket Creation Logic ---
    // In a real app, this would send data to a backend API
    const newTicketId = `TKT-${String(mockTickets.length + 1).padStart(
      3,
      "0"
    )}`;
    const newTicket = {
      ticketId: newTicketId,
      status: "Open",
      challengeId: selectedChallenge.id,
      challengeName: selectedChallenge.name,
      subject: subject,
      user: "currentUser", // Replace with actual logged-in user
      problemSetter: "admin", // Or determine dynamically
      lastUpdated: new Date().toISOString(),
      messages: [
        {
          sender: "currentUser", // Replace with actual logged-in user
          timestamp: new Date().toISOString(),
          text: message,
        },
      ],
    };

    // Add to mock data (in real app, you'd rely on backend state)
    // This is just for demo purposes and won't persist
    console.log("Creating new ticket (mock):", newTicket);
    // mockTickets.push(newTicket); // Avoid mutating imported mock data directly

    alert(`Ticket ${newTicketId} created successfully!`);
    // Navigate to the new ticket's chat page or back to the list
    navigate(`/tickets/${newTicketId}`); // Or navigate('/tickets');
    // --- End Mock Logic ---
  };

  return (
    <div className="container relative overflow-hidden">
      {/* <div className="animated-grid-background"></div> */}
      <div className="relative z-10">
        <h1 className="terminal-text text-3xl mb-6 main-title-glow">
          Create New Ticket
        </h1>

        <form onSubmit={handleSubmit} className="card card-enhanced p-6">
          {/* Challenge Selection */}
          <div className="mb-4">
            <label
              htmlFor="challengeSearch"
              className="block terminal-text mb-2"
            >
              1. Search for Challenge:
            </label>
            <input
              type="text"
              id="challengeSearch"
              placeholder="Start typing challenge name..."
              value={challengeSearchTerm}
              onChange={(e) => setChallengeSearchTerm(e.target.value)}
              className="challenge-search-input focus:border-terminal-green focus:outline-none focus:ring-1 focus:ring-terminal-green"
              autoComplete="off"
            />
            {challengeSearchTerm && filteredChallenges.length > 0 && (
              <div className="challenge-search-results">
                {filteredChallenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className="challenge-result-item"
                    onClick={() => handleChallengeSelect(challenge)}
                  >
                    {challenge.name} ({challenge.category})
                  </div>
                ))}
              </div>
            )}
            {selectedChallenge && (
              <p className="mt-2 text-sm">
                Selected Challenge:{" "}
                <span className="selected-challenge">
                  {selectedChallenge.name}
                </span>
              </p>
            )}
            {challengeSearchTerm && filteredChallenges.length === 0 && (
              <p className="mt-2 text-sm text-muted">
                No challenges found matching "{challengeSearchTerm}".
              </p>
            )}
          </div>

          {/* Subject */}
          <div className="mb-4">
            <label htmlFor="subject" className="block terminal-text mb-2">
              2. Subject:
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2 rounded-md bg-tertiary-bg border border-border-color focus:border-terminal-green focus:outline-none focus:ring-1 focus:ring-terminal-green text-text-primary text-terminal-white"
              required
            />
          </div>

          {/* Message */}
          <div className="mb-6">
            <label htmlFor="message" className="block terminal-text mb-2">
              3. Describe the Issue:
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="ticket-textarea focus:border-terminal-green focus:outline-none focus:ring-1 focus:ring-terminal-green text-terminal-green"
              rows="5"
              required
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="text-right">
            <button
              type="submit"
              className="filter-button active create-ticket-button scale-on-hover"
              disabled={!selectedChallenge}
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicket;
