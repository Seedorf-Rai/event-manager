import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function VerifyPage() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await api.get(`/tickets/${ticketId}`);
        setTicket(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    if (ticketId) fetchTicket();
  }, [ticketId]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 16,
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
          padding: 24,
          color: "#fff",
          boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
        }}
      >
        {!ticket ? (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 40,
                height: 40,
                border: "3px solid #38bdf8",
                borderTop: "3px solid transparent",
                borderRadius: "50%",
                margin: "0 auto 12px",
                animation: "spin 1s linear infinite",
              }}
            />
            <p style={{ color: "#94a3b8" }}>Loading ticket...</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 20,
              }}
            >
              {ticket.user?.photo ? (
                <img
                  src={`${import.meta.env.VITE_API_URL}${ticket.user.photo}`}
                  alt="user"
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #38bdf8",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 22,
                  }}
                >
                  {ticket.user?.name?.charAt(0)}
                </div>
              )}

              <div>
                <h2 style={{ margin: 0, fontSize: 20 }}>{ticket.user?.name}</h2>
                <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>
                  {ticket.user?.email}
                </p>
              </div>
            </div>

            {/* Ticket Info */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {[
                { label: "Ticket ID", value: ticket.ticketId },
                {
                  label: "Registration No",
                  value: ticket.user?.registrationNo,
                },
                { label: "Event", value: ticket.event?.name },
                { label: "Venue", value: ticket.event?.venue },
                {
                  label: "Date",
                  value: ticket.event?.date
                    ? new Date(ticket.event.date).toLocaleString()
                    : "—",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <span style={{ color: "#94a3b8", fontSize: 12 }}>
                    {item.label}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Status */}
            <div
              style={{
                marginTop: 20,
                padding: 12,
                borderRadius: 10,
                textAlign: "center",
                background: ticket.isUsed
                  ? "rgba(244,63,94,0.15)"
                  : "rgba(52,211,153,0.15)",
                border: ticket.isUsed
                  ? "1px solid rgba(244,63,94,0.3)"
                  : "1px solid rgba(52,211,153,0.3)",
                color: ticket.isUsed ? "#f87171" : "#34d399",
                fontWeight: 600,
              }}
            >
              {ticket.isUsed ? "Already Used ❌" : "Valid Ticket ✅"}
            </div>
          </>
        )}
      </div>

      <style>
        {`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}
      </style>
    </div>
  );
}
