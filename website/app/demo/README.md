# Restaurant Reservation System Demo

This demo has been transformed from a simple todo list to a restaurant reservation system.

## Schema Changes

The GraphQL schema now includes:

- **Customer**: Represents restaurant customers with name, email, and phone
- **Table**: Represents restaurant tables with number, capacity, and availability
- **Reservation**: Links customers to tables with datetime, party size, status, and notes
- **ReservationStatus**: Enum for tracking reservation states (PENDING, CONFIRMED, SEATED, COMPLETED, CANCELLED)

## Demo Features

The React demo app now provides:

1. **View Current Reservations**: Shows all existing reservations with customer details, table information, and status
2. **Add New Customers**: Simple form to register new customers
3. **Make Reservations**:
   - Select existing customers
   - Choose date/time and party size
   - Find available tables that match party size requirements
   - Add special notes/requests
   - Create new reservations

## State File

The `reservation.state.ts` file provides:

- Mock data for customers, tables, and initial reservations
- Options to control mock data and maximum reservations shown
- Full CRUD operations for customers, tables, and reservations
- Simple availability checking for tables based on capacity

## Usage

1. Load the schema and state file in the Virtual Dashboard
2. Set `mockDataEnabled` to `true` to see sample data
3. Adjust `maxReservations` to control how many reservations are displayed
4. Use the GraphiQL editor to test queries and mutations
5. Interact with the React demo to see the live reservation system

## GraphQL Operations

Key queries and mutations available:

```graphql
# Get all reservations
query {
  reservations {
    id
    customer {
      name
      email
    }
    table {
      number
      capacity
    }
    dateTime
    partySize
    status
    notes
  }
}

# Find available tables
query {
  availableTables(dateTime: "2024-03-15T19:00:00Z", partySize: 4) {
    id
    number
    capacity
  }
}

# Create a new reservation
mutation {
  createReservation(
    customerId: "1"
    tableId: "2"
    dateTime: "2024-03-15T19:00:00Z"
    partySize: 4
    notes: "Birthday celebration"
  ) {
    id
    status
  }
}
```
