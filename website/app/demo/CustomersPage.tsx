import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";
import {
  CREATE_CUSTOMER,
  DELETE_CUSTOMER,
  GET_CUSTOMERS,
  UPDATE_CUSTOMER,
} from "./graphql";

const CustomersPage = () => {
  const { loading, error, data, refetch } = useQuery(GET_CUSTOMERS);
  const [createCustomer] = useMutation(CREATE_CUSTOMER);
  const [updateCustomer] = useMutation(UPDATE_CUSTOMER);
  const [deleteCustomer] = useMutation(DELETE_CUSTOMER);

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [editingCustomer, setEditingCustomer] = useState<any>(null);

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
        Loading customers...
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

  const handleCreateCustomer = async () => {
    if (!newCustomer.name.trim() || !newCustomer.email.trim()) return;

    try {
      await createCustomer({
        variables: newCustomer,
      });
      setNewCustomer({ name: "", email: "", phone: "" });
      refetch();
    } catch (err) {
      console.error("Error creating customer:", err);
    }
  };

  const handleUpdateCustomer = async (customer: any) => {
    try {
      await updateCustomer({
        variables: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        },
      });
      setEditingCustomer(null);
      refetch();
    } catch (err) {
      console.error("Error updating customer:", err);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm("DELETE THIS CUSTOMER?")) return;

    try {
      await deleteCustomer({
        variables: { id: customerId },
      });
      refetch();
    } catch (err) {
      console.error("Error deleting customer:", err);
    }
  };

  const customers = (data as any)?.customers || [];

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
          Customer Management
        </h1>
      </div>

      {/* Add Customer Form */}
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
          Add New Customer
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr auto",
            gap: "16px",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            value={newCustomer.name}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, name: e.target.value })
            }
            placeholder="Name"
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
            type="email"
            value={newCustomer.email}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, email: e.target.value })
            }
            placeholder="Email"
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
            type="tel"
            value={newCustomer.phone}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, phone: e.target.value })
            }
            placeholder="Phone"
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
            onClick={handleCreateCustomer}
            disabled={!newCustomer.name.trim() || !newCustomer.email.trim()}
            style={{
              padding: "10px 20px",
              backgroundColor:
                newCustomer.name.trim() && newCustomer.email.trim()
                  ? "#475569"
                  : "#9ca3af",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              cursor:
                newCustomer.name.trim() && newCustomer.email.trim()
                  ? "pointer"
                  : "not-allowed",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Customer List */}
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
          Customers ({customers.length})
        </h2>

        {customers.length === 0 ? (
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
            No customers found
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
                gridTemplateColumns: "2fr 2fr 1fr auto",
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
              <div>Name</div>
              <div>Email</div>
              <div>Phone</div>
              <div>Actions</div>
            </div>

            {/* Customer Rows */}
            {customers.map((customer: any, index: number) => (
              <div
                key={customer.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 2fr 1fr auto",
                  padding: "16px",
                  borderBottom:
                    index < customers.length - 1 ? "1px solid #e5e5e5" : "none",
                  backgroundColor:
                    editingCustomer?.id === customer.id ? "#f8f8f8" : "#ffffff",
                }}
              >
                {editingCustomer?.id === customer.id ? (
                  <>
                    <input
                      type="text"
                      value={editingCustomer.name}
                      onChange={(e) =>
                        setEditingCustomer({
                          ...editingCustomer,
                          name: e.target.value,
                        })
                      }
                      style={{
                        padding: "8px",
                        border: "1px solid #000000",
                        fontSize: "11px",
                        fontFamily:
                          "'Helvetica Neue', Helvetica, Arial, sans-serif",
                        outline: "none",
                      }}
                    />
                    <input
                      type="email"
                      value={editingCustomer.email}
                      onChange={(e) =>
                        setEditingCustomer({
                          ...editingCustomer,
                          email: e.target.value,
                        })
                      }
                      style={{
                        padding: "8px",
                        border: "1px solid #000000",
                        fontSize: "11px",
                        fontFamily:
                          "'Helvetica Neue', Helvetica, Arial, sans-serif",
                        outline: "none",
                      }}
                    />
                    <input
                      type="tel"
                      value={editingCustomer.phone || ""}
                      onChange={(e) =>
                        setEditingCustomer({
                          ...editingCustomer,
                          phone: e.target.value,
                        })
                      }
                      style={{
                        padding: "8px",
                        border: "1px solid #000000",
                        fontSize: "11px",
                        fontFamily:
                          "'Helvetica Neue', Helvetica, Arial, sans-serif",
                        outline: "none",
                      }}
                    />
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleUpdateCustomer(editingCustomer)}
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
                        Save
                      </button>
                      <button
                        onClick={() => setEditingCustomer(null)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#ffffff",
                          color: "#000000",
                          border: "1px solid #000000",
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
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: "400",
                        color: "#000000",
                      }}
                    >
                      {customer.name}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: "400",
                        color: "#666666",
                      }}
                    >
                      {customer.email}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: "400",
                        color: "#666666",
                      }}
                    >
                      {customer.phone || "—"}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => setEditingCustomer(customer)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#ffffff",
                          color: "#000000",
                          border: "1px solid #000000",
                          fontSize: "9px",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          cursor: "pointer",
                          outline: "none",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer.id)}
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
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomersPage;
