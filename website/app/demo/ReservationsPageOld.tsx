import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";
import {
  CANCEL_RESERVATION,
  CREATE_RESERVATION,
  GET_AVAILABLE_TABLES,
  GET_CUSTOMERS,
  GET_RESERVATIONS,
  UPDATE_RESERVATION,
} from "./graphql";

const ReservationsPage = () => {
  const { loading, error, data, refetch } = useQuery(GET_RESERVATIONS);
  const { data: customersData } = useQuery(GET_CUSTOMERS);
  const [createReservation] = useMutation(CREATE_RESERVATION);
  const [updateReservation] = useMutation(UPDATE_RESERVATION);
  const [cancelReservation] = useMutation(CANCEL_RESERVATION);
  const [getAvailableTables, { data: availableTablesData }] =
    useLazyQuery(GET_AVAILABLE_TABLES);

  const [newReservation, setNewReservation] = useState({
    customerId: "",
    tableId: "",
    dateTime: "",
    partySize: 2,
    notes: "",
  });

  const [editingReservation, setEditingReservation] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    status: "",
    dateTime: "",
    partySize: 2,
    notes: "",
  });

  if (loading) return <p>Loading reservations...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const handleSearchTables = async () => {
    if (!newReservation.dateTime || !newReservation.partySize) return;
    await getAvailableTables({
      variables: {
        dateTime: newReservation.dateTime,
        partySize: newReservation.partySize,
      },
    });
  };

  const handleCreateReservation = async () => {
    if (
      !newReservation.customerId ||
      !newReservation.tableId ||
      !newReservation.dateTime
    )
      return;

    try {
      await createReservation({
        variables: newReservation,
      });
      setNewReservation({
        customerId: "",
        tableId: "",
        dateTime: "",
        partySize: 2,
        notes: "",
      });
      refetch();
    } catch (err) {
      console.error("Error creating reservation:", err);
    }
  };

  const handleEditReservation = (reservation: any) => {
    setEditingReservation(reservation);
    setEditForm({
      status: reservation.status,
      dateTime: reservation.dateTime,
      partySize: reservation.partySize,
      notes: reservation.notes || "",
    });
  };

  const handleUpdateReservation = async () => {
    try {
      await updateReservation({
        variables: {
          id: editingReservation.id,
          ...editForm,
        },
      });
      setEditingReservation(null);
      setEditForm({ status: "", dateTime: "", partySize: 2, notes: "" });
      refetch();
    } catch (err) {
      console.error("Error updating reservation:", err);
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    if (!confirm("Are you sure you want to cancel this reservation?")) return;

    try {
      await cancelReservation({
        variables: { id: reservationId },
      });
      refetch();
    } catch (err) {
      console.error("Error canceling reservation:", err);
    }
  };

  const cancelEdit = () => {
    setEditingReservation(null);
    setEditForm({ status: "", dateTime: "", partySize: 2, notes: "" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "#22c55e";
      case "PENDING":
        return "#f59e0b";
      case "SEATED":
        return "#3b82f6";
      case "COMPLETED":
        return "#6b7280";
      case "CANCELLED":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const statusOptions = [
    "PENDING",
    "CONFIRMED",
    "SEATED",
    "COMPLETED",
    "CANCELLED",
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: "30px", color: "#1f2937" }}>
        Reservation Management
      </h1>

      {/* Create New Reservation */}
      <section
        style={{
          marginBottom: "40px",
          padding: "20px",
          backgroundColor: "#f9fafb",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
        }}
      >
        <h2 style={{ marginBottom: "20px", color: "#374151" }}>
          Make New Reservation
        </h2>
        <div style={{ display: "grid", gap: "12px", maxWidth: "500px" }}>
          <select
            value={newReservation.customerId}
            onChange={(e) =>
              setNewReservation({
                ...newReservation,
                customerId: e.target.value,
              })
            }
            style={{
              padding: "10px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          >
            <option value="">Select Customer</option>
            {(customersData as any)?.customers?.map((customer: any) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} ({customer.email})
              </option>
            ))}
          </select>

          <input
            type="datetime-local"
            value={newReservation.dateTime}
            onChange={(e) =>
              setNewReservation({ ...newReservation, dateTime: e.target.value })
            }
            style={{
              padding: "10px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
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
            placeholder="Party size"
            style={{
              padding: "10px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          />

          <button
            onClick={handleSearchTables}
            disabled={!newReservation.dateTime || !newReservation.partySize}
            style={{
              padding: "10px 16px",
              backgroundColor:
                newReservation.dateTime && newReservation.partySize
                  ? "#10b981"
                  : "#9ca3af",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor:
                newReservation.dateTime && newReservation.partySize
                  ? "pointer"
                  : "not-allowed",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Find Available Tables
          </button>

          {(availableTablesData as any)?.availableTables?.length > 0 && (
            <select
              value={newReservation.tableId}
              onChange={(e) =>
                setNewReservation({
                  ...newReservation,
                  tableId: e.target.value,
                })
              }
              style={{
                padding: "10px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            >
              <option value="">Select Table</option>
              {(availableTablesData as any).availableTables.map(
                (table: any) => (
                  <option key={table.id} value={table.id}>
                    Table {table.number} (capacity: {table.capacity})
                  </option>
                )
              )}
            </select>
          )}

          <textarea
            value={newReservation.notes}
            onChange={(e) =>
              setNewReservation({ ...newReservation, notes: e.target.value })
            }
            placeholder="Special requests or notes (optional)"
            rows={3}
            style={{
              padding: "10px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              resize: "vertical",
            }}
          />

          <button
            onClick={handleCreateReservation}
            disabled={
              !newReservation.customerId ||
              !newReservation.tableId ||
              !newReservation.dateTime
            }
            style={{
              padding: "12px 20px",
              backgroundColor:
                newReservation.customerId &&
                newReservation.tableId &&
                newReservation.dateTime
                  ? "#3b82f6"
                  : "#9ca3af",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor:
                newReservation.customerId &&
                newReservation.tableId &&
                newReservation.dateTime
                  ? "pointer"
                  : "not-allowed",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Make Reservation
          </button>
        </div>
      </section>

      {/* Current Reservations */}
      <section>
        <h2 style={{ marginBottom: "20px", color: "#374151" }}>
          Current Reservations ({(data as any)?.reservations?.length || 0})
        </h2>
        <div style={{ display: "grid", gap: "12px" }}>
          {(data as any)?.reservations?.map((reservation: any) => (
            <div
              key={reservation.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "16px",
                backgroundColor: "white",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              {editingReservation?.id === reservation.id ? (
                // Edit Form
                <div
                  style={{ display: "grid", gap: "10px", maxWidth: "400px" }}
                >
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value })
                    }
                    style={{
                      padding: "8px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <input
                    type="datetime-local"
                    value={editForm.dateTime}
                    onChange={(e) =>
                      setEditForm({ ...editForm, dateTime: e.target.value })
                    }
                    style={{
                      padding: "8px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  />
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={editForm.partySize}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        partySize: parseInt(e.target.value),
                      })
                    }
                    style={{
                      padding: "8px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  />
                  <textarea
                    value={editForm.notes}
                    onChange={(e) =>
                      setEditForm({ ...editForm, notes: e.target.value })
                    }
                    rows={2}
                    style={{
                      padding: "8px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={handleUpdateReservation}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#6b7280",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // Display Mode
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "8px",
                      }}
                    >
                      <strong style={{ fontSize: "16px", color: "#1f2937" }}>
                        {reservation.customer.name}
                      </strong>
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "white",
                          backgroundColor: getStatusColor(reservation.status),
                        }}
                      >
                        {reservation.status}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        lineHeight: "1.4",
                      }}
                    >
                      <div>{reservation.customer.email}</div>
                      <div>
                        Table {reservation.table.number} •{" "}
                        {reservation.partySize} guests
                      </div>
                      <div>
                        {new Date(reservation.dateTime).toLocaleString()}
                      </div>
                      {reservation.notes && (
                        <div style={{ fontStyle: "italic", marginTop: "4px" }}>
                          Notes: {reservation.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    <button
                      onClick={() => handleEditReservation(reservation)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#f59e0b",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Edit
                    </button>
                    {reservation.status !== "CANCELLED" && (
                      <button
                        onClick={() => handleCancelReservation(reservation.id)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {!(data as any)?.reservations?.length && (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "#6b7280",
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          >
            No reservations found. Create your first reservation above!
          </div>
        )}
      </section>
    </div>
  );
};

export default ReservationsPage;
