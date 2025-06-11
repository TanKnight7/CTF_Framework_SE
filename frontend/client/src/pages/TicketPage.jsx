import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { mockTickets } from "../data/Data";

const Ticket = () => {
  const [tickets, setTickets] = useState(mockTickets);
  const navigate = useNavigate();

  const handleRowClick = (ticketId) => {
    navigate(`/tickets/${ticketId}`);
  };

  const getStatusClass = (status) => {
    return status.toLowerCase() === "open"
      ? "ticket-status-open"
      : "ticket-status-closed";
  };

  return (
    <div className="container relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="terminal-text text-3xl main-title-glow">
            Support Tickets
          </h1>
          <Link to="/tickets/CreateTicket">
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
                      key={ticket.ticketId}
                      className="border-b border-border-color table-row-enhanced cursor-pointer"
                      onClick={() => handleRowClick(ticket.ticketId)}
                      title={`View Ticket ${ticket.ticketId}`}
                    >
                      <td className="py-3 px-4 text-text-primary font-mono">
                        {ticket.ticketId}
                      </td>
                      <td className="py-3 px-4">
                        <span className={getStatusClass(ticket.status)}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-text-primary">
                        {ticket.challengeName}
                      </td>
                      <td className="py-3 px-4 text-muted text-sm">
                        {new Date(ticket.lastUpdated).toLocaleString()}
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
