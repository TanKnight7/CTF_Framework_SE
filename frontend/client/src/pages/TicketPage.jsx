import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllTickets } from "../services/apiCTF";

const Ticket = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllTickets();

      if (response.error) {
        setError(response.error);
      } else {
        setTickets(response);
      }
    } catch (err) {
      setError("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (ticketId) => {
    navigate(`/tickets/${ticketId}`);
  };

  const getStatusClass = (status) => {
    return status.toLowerCase() === "open"
      ? "ticket-status-open"
      : "ticket-status-closed";
  };

  if (loading) {
    return (
      <div className="container relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-center items-center h-64">
            <div className="terminal-text pulse">Loading tickets...</div>
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
                onClick={fetchTickets}
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="terminal-text text-3xl main-title-glow">
            Support Tickets
          </h1>
          <Link to="/tickets/create">
            <button className="filter-button active create-ticket-button scale-on-hover">
              + Create New Ticket
            </button>
          </Link>
        </div>

        <div className="card card-enhanced p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-color bg-tertiary-bg">
                  <th className="text-left py-3 px-4 terminal-text table-header-glow">
                    Ticket ID
                  </th>
                  <th className="text-left py-3 px-4 terminal-text table-header-glow">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 terminal-text table-header-glow">
                    Challenge
                  </th>
                  <th className="text-left py-3 px-4 terminal-text table-header-glow">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody>
                {tickets.length > 0 ? (
                  tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="border-b border-border-color table-row-enhanced cursor-pointer"
                      onClick={() => handleRowClick(ticket.id)}
                      title={`View Ticket ${ticket.ticket_id}`}
                    >
                      <td className="py-3 px-4 text-text-primary font-mono">
                        {ticket.ticket_id}
                      </td>
                      <td className="py-3 px-4">
                        <span className={getStatusClass(ticket.status)}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-text-primary">
                        {ticket.challenge_name}
                      </td>
                      <td className="py-3 px-4 text-muted text-sm">
                        {new Date(ticket.last_updated).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-muted">
                      No tickets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ticket;
