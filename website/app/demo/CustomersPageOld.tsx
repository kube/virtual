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
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  if (loading) return (
    <div style={{ 
      padding: "32px",
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      fontSize: "13px",
      color: "#000000",
      textTransform: "uppercase",
      letterSpacing: "0.05em"
    }}>
      Loading customers...
    </div>
  );
  
  if (error) return (
    <div style={{ 
      padding: "32px",
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      fontSize: "13px",
      color: "#ff0000",
      textTransform: "uppercase",
      letterSpacing: "0.05em"
    }}>
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

  const handleEditCustomer = (customer: any) => {
    setEditingCustomer(customer);
    setEditForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || "",
    });
  };

  const handleUpdateCustomer = async () => {
    if (!editForm.name.trim() || !editForm.email.trim()) return;

    try {
      await updateCustomer({
        variables: {
          id: editingCustomer.id,
          ...editForm,
        },
      });
      setEditingCustomer(null);
      setEditForm({ name: "", email: "", phone: "" });
      refetch();
    } catch (err) {
      console.error("Error updating customer:", err);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;

    try {
      await deleteCustomer({
        variables: { id: customerId },
      });
      refetch();
    } catch (err) {
      console.error("Error deleting customer:", err);
    }
  };

  const cancelEdit = () => {
    setEditingCustomer(null);
    setEditForm({ name: "", email: "", phone: "" });
  };

  return (
    <div style={{ 
      padding: "0",
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif"
    }}>
      <h1 style={{ 
        marginBottom: "32px", 
        color: "#000000",
        fontSize: "16px",
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        borderBottom: "2px solid #000000",
        paddingBottom: "16px"
      }}>
        Customer Management
      </h1>

      {/* Add New Customer */}
      <section
        style={{
          marginBottom: "48px",
          padding: "24px",
          backgroundColor: "#f8f8f8",
          border: "1px solid #000000",
        }}
      >
        <h2 style={{ 
          marginBottom: "24px", 
          color: "#000000",
          fontSize: "12px",
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: "0.05em"
        }}>
          Add New Customer
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr auto",
            gap: "16px",
            alignItems: "end",
          }}
        >
          <input
            type="text"
            value={newCustomer.name}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, name: e.target.value })
            }
            placeholder="CUSTOMER NAME *"
            style={{
              padding: "12px 16px",
              border: "1px solid #000000",
              backgroundColor: "#ffffff",
              fontSize: "12px",
              fontWeight: "400",
              color: "#000000",
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          />
          <input
            type="email"
            value={newCustomer.email}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, email: e.target.value })
            }
            placeholder="EMAIL *"
            style={{
              padding: "12px 16px",
              border: "1px solid #000000",
              backgroundColor: "#ffffff",
              fontSize: "12px",
              fontWeight: "400",
              color: "#000000",
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          />
          <input
            type="tel"
            value={newCustomer.phone}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, phone: e.target.value })
            }
            placeholder="PHONE"
            style={{
              padding: "12px 16px",
              border: "1px solid #000000",
              backgroundColor: "#ffffff",
              fontSize: "12px",
              fontWeight: "400",
              color: "#000000",
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          />
          <button
            onClick={handleCreateCustomer}
            disabled={!newCustomer.name.trim() || !newCustomer.email.trim()}
            style={{
              padding: "12px 24px",
              backgroundColor: newCustomer.name.trim() && newCustomer.email.trim()
                ? "#000000"
                : "#cccccc",
              color: newCustomer.name.trim() && newCustomer.email.trim()
                ? "#ffffff"
                : "#666666",
              border: "1px solid #000000",
              cursor: newCustomer.name.trim() && newCustomer.email.trim()
                ? "pointer"
                : "not-allowed",
              fontSize: "11px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            }}
          >
            Add Customer
          </button>
        </div>
      </section>

      {/* Customer List */}
      <section>
        <h2 style={{ 
          marginBottom: "24px", 
          color: "#000000",
          fontSize: "12px",
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          borderBottom: "1px solid #000000",
          paddingBottom: "8px"
        }}>
          All Customers ({(data as any)?.customers?.length || 0})
        </h2>
        <div style={{ 
          display: "grid", 
          gap: "1px",
          backgroundColor: "#000000"
        }}>
          {(data as any)?.customers?.map((customer: any) => (
            <div
              key={customer.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "16px",
                backgroundColor: "white",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              {editingCustomer?.id === customer.id ? (
                // Edit Form
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    style={{
                      padding: "8px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      minWidth: "150px",
                      fontSize: "14px",
                    }}
                  />
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    style={{
                      padding: "8px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      minWidth: "150px",
                      fontSize: "14px",
                    }}
                  />
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    style={{
                      padding: "8px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      minWidth: "120px",
                      fontSize: "14px",
                    }}
                  />
                  <button
                    onClick={handleUpdateCustomer}
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
              ) : (
                // Display Mode
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#1f2937",
                      }}
                    >
                      {customer.name}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        marginTop: "4px",
                      }}
                    >
                      {customer.email}
                    </div>
                    {customer.phone && (
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#6b7280",
                          marginTop: "2px",
                        }}
                      >
                        {customer.phone}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => handleEditCustomer(customer)}
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
                    <button
                      onClick={() => handleDeleteCustomer(customer.id)}
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
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {!(data as any)?.customers?.length && (
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
            No customers found. Add your first customer above!
          </div>
        )}
      </section>
    </div>
  );
};

export default CustomersPage;
