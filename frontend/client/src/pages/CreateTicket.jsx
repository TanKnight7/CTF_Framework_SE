import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getChallenges, createTicket } from "../services/apiCTF";
import { toast } from "react-toastify";

const CreateTicket = () => {
  const [challenges, setChallenges] = useState([]);
  const [challengeSearchTerm, setChallengeSearchTerm] = useState("");
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getChallenges();

      if (response.error) {
        setError(response.error);
      } else {
        setChallenges(response);
      }
    } catch (err) {
      setError("Failed to fetch challenges");
    } finally {
      setLoading(false);
    }
  };

  const filteredChallenges = useMemo(() => {
    if (!challengeSearchTerm) return [];
    return challenges.filter((challenge) =>
      challenge.title.toLowerCase().includes(challengeSearchTerm.toLowerCase())
    );
  }, [challengeSearchTerm, challenges]);

  const handleChallengeSelect = (challenge) => {
    setSelectedChallenge(challenge);
    setChallengeSearchTerm("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedChallenge || !subject || !message || creating) {
      if (!selectedChallenge || !subject || !message) {
        toast.error(
          "Please select a challenge and fill in both subject and message."
        );
      }
      return;
    }

    try {
      setCreating(true);
      const ticketData = {
        challenge_id: selectedChallenge.id,
        title: subject,
        description: message,
        initial_message: `${subject}\n\n${message}`,
      };

      const response = await createTicket(ticketData);

      if (response.error) {
        return;
      }
      //   if (response.error.includes("already have an open ticket")) {
      //     toast.error(
      //       "You already have an open ticket for this challenge. Please use the existing ticket or close it first."
      //     );
      //   } else {
      //     toast.error(response.error);
      //   }
      //   return;
      // }

      // toast.success(`Ticket ${response.ticket_id} created successfully!`);
      navigate(`/tickets/${response.id}`);
    } catch (err) {
      // toast.error("Failed to create ticket");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="container relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-center items-center h-64">
            <div className="terminal-text pulse">Loading challenges...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="terminal-text text-red-500 mb-4">{error}</div>
              <button
                onClick={fetchChallenges}
                className="filter-button active scale-on-hover"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container relative overflow-hidden">
      <div className="relative z-10">
        <h1 className="terminal-text text-3xl mb-6 main-title-glow">
          Create New Ticket
        </h1>

        <form onSubmit={handleSubmit} className="card card-enhanced p-6">
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
                    {challenge.title} ({challenge.category})
                  </div>
                ))}
              </div>
            )}
            {selectedChallenge && (
              <p className="mt-2 text-sm">
                Selected Challenge:{" "}
                <span className="selected-challenge">
                  {selectedChallenge.title}
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
              disabled={creating}
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
              disabled={creating}
            ></textarea>
          </div>

          <div className="text-right">
            <button
              type="submit"
              className="filter-button active create-ticket-button scale-on-hover disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedChallenge || creating}
            >
              {creating ? "Creating..." : "Submit Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicket;
