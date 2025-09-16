import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable,
} from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import type { VirtualServer } from "@kube/virtual";
import React, { useEffect, useMemo, useState } from "react";
import CustomersPage from "./CustomersPage";
import { DemoRouter, Route } from "./DemoRouter";
import Navigation from "./Navigation";
import ReservationsPage from "./ReservationsPage";

// Layout component with navigation
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        display: "flex",
      }}
    >
      <Navigation />
      <div
        style={{
          flex: 1,
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            borderBottom: "1px solid #e5e7eb",
            padding: "24px 32px",
            height: "auto",
            display: "flex",
            alignItems: "center",
            borderRadius: "12px 0 0 0",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: "600",
              color: "#1f2937",
              letterSpacing: "normal",
              lineHeight: "1.2",
            }}
          >
            Restaurant Management
          </h1>
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            minHeight: "calc(100vh - 70px)",
            padding: "32px",
            borderRadius: "0 0 12px 0",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

const App: React.FC<{ virtualServer: VirtualServer }> = ({ virtualServer }) => {
  const [stateReloadId, setStateReloadId] = useState(0);

  useEffect(() => {
    return virtualServer.addEventListener((event) => {
      // We should not depend directly on these event types, but rather on a derived event provided by the VirtualServer directly.
      // Something like "statefile_invalidated" or something like that. (It would also only apply to currently selected state file changes)
      if (
        event.type === "schema_updated" ||
        event.type === "statefile_created" ||
        event.type === "statefile_updated" ||
        event.type === "option_updated"
      ) {
        setStateReloadId((prev) => prev + 1);
      }
    });
  }, [virtualServer]);

  const client = useMemo(() => {
    return new ApolloClient({
      link: new ApolloLink((operation) => {
        return new Observable((observer) => {
          const { query, variables } = operation;
          virtualServer
            .resolve(query, variables)
            .then((result) => {
              observer.next(result);
              observer.complete();
            })
            .catch((error) => {
              observer.error(error);
            });
        });
      }),
      cache: new InMemoryCache(),
    });
  }, [virtualServer, stateReloadId]);

  return (
    <ApolloProvider client={client}>
      <DemoRouter initialRoute="/demo/customers">
        <Layout>
          <Route path="/demo/customers">
            <CustomersPage />
          </Route>
          <Route path="/demo/reservations">
            <ReservationsPage />
          </Route>
        </Layout>
      </DemoRouter>
    </ApolloProvider>
  );
};

export default App;
