import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";
import {
  CANCEL_RESERVATION,
  CREATE_RESERVATION,
  GET_CUSTOMERS,
  GET_RESERVATIONS,
  GET_TABLES,
  UPDATE_RESERVATION,
} from "./graphql";

const ReservationsPage = () => {
  const { data: customersData } = useQuery(GET_CUSTOMERS);
  const { data: tablesData } = useQuery(GET_TABLES);
  const {
    data: reservationsData,
    loading,
    error,
    refetch,
  } = useQuery(GET_RESERVATIONS);
  const [createReservation] = useMutation(CREATE_RESERVATION);
  const [updateReservation] = useMutation(UPDATE_RESERVATION);
  const [cancelReservation] = useMutation(CANCEL_RESERVATION);

  const [newReservation, setNewReservation] = useState({
    customerId: "",
    tableId: "",
    date: "",
    time: "",
    partySize: 2,
  });

  if (loading)
    return (
      <div
        style={{
          padding: "32px",
          fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: "14px",
          color: "#6b7280",
        }}
      >
        Loading reservations...
      </div>
    );

  if (error)
    return (
      <div
        style={{
          padding: "32px",
          fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: "14px",
          color: "#dc2626",
          backgroundColor: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "8px",
        }}
      >
        Error: {error.message}
      </div>
    );

  const handleCreateReservation = async () => {
    if (
      !newReservation.customerId ||
      !newReservation.tableId ||
      !newReservation.date ||
      !newReservation.time
    ) {
      return;
    }

    try {
      await createReservation({
        variables: newReservation,
      });
      setNewReservation({
        customerId: "",
        tableId: "",
        date: "",
        time: "",
        partySize: 2,
      });
      refetch();
    } catch (err) {
      console.error("Error creating reservation:", err);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateReservation({
        variables: { id, status },
      });
      refetch();
    } catch (err) {
      console.error("Error updating reservation status:", err);
    }
  };

  const handleCancelReservation = async (id: string) => {
    if (!confirm("CANCEL THIS RESERVATION?")) return;

    try {
      await cancelReservation({
        variables: { id },
      });
      refetch();
    } catch (err) {
      console.error("Error canceling reservation:", err);
    }
  };

  const customers = (customersData as any)?.customers || [];
  const tables = (tablesData as any)?.tables || [];
  const reservations = (reservationsData as any)?.reservations || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "#059669";
      case "PENDING":
        return "#d97706";
      case "CANCELLED":
        return "#dc2626";
      case "COMPLETED":
        return "#6b7280";
      default:
        return "#374151";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "#d1fae5";
      case "PENDING":
        return "#fef3c7";
      case "CANCELLED":
        return "#fee2e2";
      case "COMPLETED":
        return "#f3f4f6";
      default:
        return "#f9fafb";
    }
  };

  return (
    <div
      style={{
        padding: "0",
        fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        backgroundColor: "#ffffff",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: "16px",
          marginBottom: "24px",
        }}
      >
        <h1
          style={{
            margin: "0",
            color: "#1f2937",
            fontSize: "18px",
            fontWeight: "600",
          }}
        >
          Reservation Management
        </h1>
      </div>

      {/* Create Reservation Form */}
      <div
        style={{
          marginBottom: "32px",
          padding: "24px",
          backgroundColor: "#f8f9fa",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
        }}
      >
        <h2
          style={{
            margin: "0 0 20px 0",
            color: "#374151",
            fontSize: "16px",
            fontWeight: "500",
          }}
        >
          New Reservation
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr 100px auto",
            gap: "16px",
            alignItems: "center",
          }}
        >
          <select
            value={newReservation.customerId}
            onChange={(e) =>
              setNewReservation({
                ...newReservation,
                customerId: e.target.value,
              })
            }
            style={{
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              backgroundColor: "#ffffff",
              fontSize: "14px",
              fontWeight: "400",
              color: "#374151",
              fontFamily:
                "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
              outline: "none",
              borderRadius: "6px",
            }}
          >
            <option value="">Select Customer</option>
            {customers.map((customer: any) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>

          <select
            value={newReservation.tableId}
            onChange={(e) =>
              setNewReservation({ ...newReservation, tableId: e.target.value })
            }
            style={{
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              backgroundColor: "#ffffff",
              fontSize: "14px",
              fontWeight: "400",
              color: "#374151",
              fontFamily:
                "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
              outline: "none",
              borderRadius: "6px",
            }}
          >
            <option value="">Select Table</option>
            {tables.map((table: any) => (
              <option key={table.id} value={table.id}>
                Table {table.number} ({table.capacity})
              </option>
            ))}
          </select>

          <input
            type="date"
            value={newReservation.date}
            onChange={(e) =>
              setNewReservation({ ...newReservation, date: e.target.value })
            }
            style={{
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              backgroundColor: "#ffffff",
              fontSize: "14px",
              fontWeight: "400",
              color: "#374151",
              fontFamily:
                "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
              outline: "none",
              borderRadius: "6px",
            }}
          />

          <input
            type="time"
            value={newReservation.time}
            onChange={(e) =>
              setNewReservation({ ...newReservation, time: e.target.value })
            }
            style={{
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              backgroundColor: "#ffffff",
              fontSize: "14px",
              fontWeight: "400",
              color: "#374151",
              fontFamily:
                "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
              outline: "none",
              borderRadius: "6px",
            }}
          />

          <input
            type="number"
            min="1"
            max="12"
            value={newReservation.partySize}
            onChange={(e) =>
              setNewReservation({
                ...newReservation,
                partySize: parseInt(e.target.value),
              })
            }
            style={{
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              backgroundColor: "#ffffff",
              fontSize: "14px",
              fontWeight: "400",
              color: "#374151",
              fontFamily:
                "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
              outline: "none",
              borderRadius: "6px",
            }}
          />

          <button
            onClick={handleCreateReservation}
            disabled={
              !newReservation.customerId ||
              !newReservation.tableId ||
              !newReservation.date ||
              !newReservation.time
            }
            style={{
              padding: "10px 20px",
              backgroundColor:
                newReservation.customerId &&
                newReservation.tableId &&
                newReservation.date &&
                newReservation.time
                  ? "#2563eb"
                  : "#9ca3af",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              cursor:
                newReservation.customerId &&
                newReservation.tableId &&
                newReservation.date &&
                newReservation.time
                  ? "pointer"
                  : "not-allowed",
            }}
          >
            Create
          </button>
        </div>
      </div>

      {/* Reservations List */}
      <div>
        <h2
          style={{
            margin: "0 0 16px 0",
            color: "#000000",
            fontSize: "12px",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            borderBottom: "1px solid #000000",
            paddingBottom: "8px",
          }}
        >
          Current Reservations ({reservations.length})
        </h2>

        {reservations.length === 0 ? (
          <div
            style={{
              padding: "32px",
              textAlign: "center",
              color: "#666666",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              border: "1px solid #e5e5e5",
            }}
          >
            No reservations found
          </div>
        ) : (
          <div
            style={{
              border: "1px solid #000000",
              backgroundColor: "#ffffff",
            }}
          >
            {/* Header Row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr 100px auto",
                padding: "16px",
                backgroundColor: "#000000",
                color: "#ffffff",
                fontSize: "10px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                borderBottom: "1px solid #000000",
              }}
            >
              <div>Customer</div>
              <div>Table</div>
              <div>Date & Time</div>
              <div>Party Size</div>
              <div>Status</div>
              <div>Actions</div>
            </div>

            {/* Reservation Rows */}
            {reservations.map((reservation: any, index: number) => (
              <div
                key={reservation.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1fr 100px auto",
                  padding: "16px",
                  borderBottom:
                    index < reservations.length - 1
                      ? "1px solid #e5e5e5"
                      : "none",
                  backgroundColor: "#ffffff",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "400",
                    color: "#000000",
                  }}
                >
                  {reservation.customer?.name}
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#666666",
                      marginTop: "2px",
                    }}
                  >
                    {reservation.customer?.email}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "400",
                    color: "#666666",
                  }}
                >
                  Table {reservation.table?.number}
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#999999",
                      marginTop: "2px",
                    }}
                  >
                    Cap: {reservation.table?.capacity}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "400",
                    color: "#666666",
                  }}
                >
                  {reservation.date}
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#999999",
                      marginTop: "2px",
                    }}
                  >
                    {reservation.time}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "400",
                    color: "#666666",
                  }}
                >
                  {reservation.partySize} guests
                </div>

                <div
                  style={{
                    fontSize: "9px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: getStatusColor(reservation.status),
                    backgroundColor: getStatusBgColor(reservation.status),
                    border: `1px solid ${getStatusColor(reservation.status)}`,
                    padding: "4px 8px",
                    textAlign: "center",
                  }}
                >
                  {reservation.status}
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  {reservation.status === "PENDING" && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(reservation.id, "CONFIRMED")
                      }
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#000000",
                        color: "#ffffff",
                        border: "1px solid #000000",
                        fontSize: "9px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        cursor: "pointer",
                        outline: "none",
                      }}
                    >
                      Confirm
                    </button>
                  )}

                  {reservation.status === "CONFIRMED" && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(reservation.id, "COMPLETED")
                      }
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#666666",
                        color: "#ffffff",
                        border: "1px solid #666666",
                        fontSize: "9px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        cursor: "pointer",
                        outline: "none",
                      }}
                    >
                      Complete
                    </button>
                  )}

                  {reservation.status !== "CANCELLED" &&
                    reservation.status !== "COMPLETED" && (
                      <button
                        onClick={() => handleCancelReservation(reservation.id)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#ffffff",
                          color: "#ff0000",
                          border: "1px solid #ff0000",
                          fontSize: "9px",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          cursor: "pointer",
                          outline: "none",
                        }}
                      >
                        Cancel
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationsPage;
