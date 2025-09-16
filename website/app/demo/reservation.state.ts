export default VirtualState(
  {
    mockDataEnabled: { type: "Boolean" },
    maxReservations: { type: "Number" },
  },
  (opts) => {
    // Mock data
    const customers = [
      {
        id: "1",
        name: "John Smith",
        email: "john@example.com",
        phone: "555-1234",
        createdAt: "2024-01-01T10:00:00Z",
      },
      {
        id: "2",
        name: "Sarah Johnson",
        email: "sarah@example.com",
        phone: "555-5678",
        createdAt: "2024-01-02T11:00:00Z",
      },
      {
        id: "3",
        name: "Mike Chen",
        email: "mike@example.com",
        phone: "555-9012",
        createdAt: "2024-01-03T12:00:00Z",
      },
    ];

    const tables = [
      { id: "1", number: 1, capacity: 2, isAvailable: true },
      { id: "2", number: 2, capacity: 4, isAvailable: true },
      { id: "3", number: 3, capacity: 6, isAvailable: true },
      { id: "4", number: 4, capacity: 2, isAvailable: false },
      { id: "5", number: 5, capacity: 8, isAvailable: true },
    ];

    let reservations = opts.mockDataEnabled
      ? [
          {
            id: "1",
            customer: customers[0],
            table: tables[0],
            dateTime: "2024-03-15T19:00:00Z",
            partySize: 2,
            status: "CONFIRMED",
            notes: "Anniversary dinner",
            createdAt: "2024-03-01T10:00:00Z",
            updatedAt: "2024-03-01T10:00:00Z",
          },
          {
            id: "2",
            customer: customers[1],
            table: tables[1],
            dateTime: "2024-03-15T20:00:00Z",
            partySize: 4,
            status: "PENDING",
            notes: "Business dinner",
            createdAt: "2024-03-02T11:00:00Z",
            updatedAt: "2024-03-02T11:00:00Z",
          },
        ]
      : [];

    let nextCustomerId = customers.length + 1;
    let nextReservationId = reservations.length + 1;

    return {
      resolvers: {
        Query: {
          customers: () => customers,
          customer: (_: any, { id }: { id: string }) =>
            customers.find((c) => c.id === id),

          tables: () => tables,
          table: (_: any, { id }: { id: string }) =>
            tables.find((t) => t.id === id),

          reservations: () => reservations.slice(0, opts.maxReservations || 50),
          reservation: (_: any, { id }: { id: string }) =>
            reservations.find((r) => r.id === id),

          availableTables: (
            _: any,
            { dateTime, partySize }: { dateTime: string; partySize: number }
          ) => {
            // Simple availability check - in real app would check against existing reservations for that time
            return tables.filter(
              (table) => table.isAvailable && table.capacity >= partySize
            );
          },
        },

        Mutation: {
          createCustomer: (
            _: any,
            {
              name,
              email,
              phone,
            }: { name: string; email: string; phone?: string }
          ) => {
            const newCustomer = {
              id: String(nextCustomerId++),
              name,
              email,
              phone: phone || null,
              createdAt: new Date().toISOString(),
            };
            customers.push(newCustomer);
            return newCustomer;
          },

          updateCustomer: (
            _: any,
            {
              id,
              name,
              email,
              phone,
            }: { id: string; name?: string; email?: string; phone?: string }
          ) => {
            const customer = customers.find((c) => c.id === id);
            if (!customer) throw new Error("Customer not found");

            if (name) customer.name = name;
            if (email) customer.email = email;
            if (phone !== undefined) customer.phone = phone;

            return customer;
          },

          deleteCustomer: (_: any, { id }: { id: string }) => {
            const index = customers.findIndex((c) => c.id === id);
            if (index === -1) throw new Error("Customer not found");

            const customer = customers[index];
            customers.splice(index, 1);
            return customer;
          },

          createTable: (
            _: any,
            { number, capacity }: { number: number; capacity: number }
          ) => {
            const newTable = {
              id: String(tables.length + 1),
              number,
              capacity,
              isAvailable: true,
            };
            tables.push(newTable);
            return newTable;
          },

          updateTable: (
            _: any,
            {
              id,
              number,
              capacity,
              isAvailable,
            }: {
              id: string;
              number?: number;
              capacity?: number;
              isAvailable?: boolean;
            }
          ) => {
            const table = tables.find((t) => t.id === id);
            if (!table) throw new Error("Table not found");

            if (number) table.number = number;
            if (capacity) table.capacity = capacity;
            if (isAvailable !== undefined) table.isAvailable = isAvailable;

            return table;
          },

          deleteTable: (_: any, { id }: { id: string }) => {
            const index = tables.findIndex((t) => t.id === id);
            if (index === -1) throw new Error("Table not found");

            const table = tables[index];
            tables.splice(index, 1);
            return table;
          },

          createReservation: (
            _: any,
            {
              customerId,
              tableId,
              dateTime,
              partySize,
              notes,
            }: {
              customerId: string;
              tableId: string;
              dateTime: string;
              partySize: number;
              notes?: string;
            }
          ) => {
            const customer = customers.find((c) => c.id === customerId);
            const table = tables.find((t) => t.id === tableId);

            if (!customer) throw new Error("Customer not found");
            if (!table) throw new Error("Table not found");

            const newReservation = {
              id: String(nextReservationId++),
              customer,
              table,
              dateTime,
              partySize,
              status: "PENDING",
              notes: notes || null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            reservations.push(newReservation);
            return newReservation;
          },

          updateReservation: (
            _: any,
            {
              id,
              status,
              dateTime,
              partySize,
              notes,
            }: {
              id: string;
              status?: string;
              dateTime?: string;
              partySize?: number;
              notes?: string;
            }
          ) => {
            const reservation = reservations.find((r) => r.id === id);
            if (!reservation) throw new Error("Reservation not found");

            if (status) reservation.status = status;
            if (dateTime) reservation.dateTime = dateTime;
            if (partySize) reservation.partySize = partySize;
            if (notes !== undefined) reservation.notes = notes;
            reservation.updatedAt = new Date().toISOString();

            return reservation;
          },

          cancelReservation: (_: any, { id }: { id: string }) => {
            const reservation = reservations.find((r) => r.id === id);
            if (!reservation) throw new Error("Reservation not found");

            reservation.status = "CANCELLED";
            reservation.updatedAt = new Date().toISOString();

            return reservation;
          },
        },
      },
    };
  }
);
