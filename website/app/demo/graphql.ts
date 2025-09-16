import { gql } from "@apollo/client";

// Customer Queries and Mutations
export const GET_CUSTOMERS = gql`
  query {
    customers {
      id
      name
      email
      phone
    }
  }
`;

export const CREATE_CUSTOMER = gql`
  mutation CreateCustomer($name: String!, $email: String!, $phone: String) {
    createCustomer(name: $name, email: $email, phone: $phone) {
      id
      name
      email
      phone
    }
  }
`;

export const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer(
    $id: ID!
    $name: String
    $email: String
    $phone: String
  ) {
    updateCustomer(id: $id, name: $name, email: $email, phone: $phone) {
      id
      name
      email
      phone
    }
  }
`;

export const DELETE_CUSTOMER = gql`
  mutation DeleteCustomer($id: ID!) {
    deleteCustomer(id: $id) {
      id
      name
    }
  }
`;

// Reservation Queries and Mutations
export const GET_RESERVATIONS = gql`
  query {
    reservations {
      id
      customer {
        id
        name
        email
        phone
      }
      table {
        id
        number
        capacity
      }
      dateTime
      partySize
      status
      notes
      createdAt
    }
  }
`;

export const GET_TABLES = gql`
  query {
    tables {
      id
      number
      capacity
    }
  }
`;

export const GET_AVAILABLE_TABLES = gql`
  query GetAvailableTables($dateTime: String!, $partySize: Int!) {
    availableTables(dateTime: $dateTime, partySize: $partySize) {
      id
      number
      capacity
    }
  }
`;

export const CREATE_RESERVATION = gql`
  mutation CreateReservation(
    $customerId: ID!
    $tableId: ID!
    $dateTime: String!
    $partySize: Int!
    $notes: String
  ) {
    createReservation(
      customerId: $customerId
      tableId: $tableId
      dateTime: $dateTime
      partySize: $partySize
      notes: $notes
    ) {
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
`;

export const UPDATE_RESERVATION = gql`
  mutation UpdateReservation(
    $id: ID!
    $status: ReservationStatus
    $dateTime: String
    $partySize: Int
    $notes: String
  ) {
    updateReservation(
      id: $id
      status: $status
      dateTime: $dateTime
      partySize: $partySize
      notes: $notes
    ) {
      id
      status
      dateTime
      partySize
      notes
    }
  }
`;

export const CANCEL_RESERVATION = gql`
  mutation CancelReservation($id: ID!) {
    cancelReservation(id: $id) {
      id
      status
    }
  }
`;
