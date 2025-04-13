import {
  ApolloClient,
  ApolloLink,
  gql,
  InMemoryCache,
  Observable,
} from "@apollo/client";
import { ApolloProvider, useMutation, useQuery } from "@apollo/client/react";
import type { VirtualServer } from "@kube/virtual";
import React, { useEffect, useMemo, useState } from "react";

// GraphQL Queries and Mutations
const GET_TODOS = gql`
  query {
    todos {
      id
      title
      completed
      createdAt
      updatedAt
    }
  }
`;

const CREATE_TODO = gql`
  mutation CreateToDo($title: String!, $completed: Boolean!) {
    createToDo(title: $title, completed: $completed) {
      id
      title
      completed
    }
  }
`;

const ToDoList = () => {
  const { loading, error, data } = useQuery(GET_TODOS);
  const [createToDo] = useMutation(CREATE_TODO);
  const [newToDo, setNewToDo] = useState("");

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const handleAddToDo = async () => {
    if (!newToDo.trim()) return;
    await createToDo({
      variables: { title: "Something new!", completed: false },
    });
    setNewToDo("");
  };

  return (
    <div>
      <h1>ToDo List</h1>
      <ul>
        {data.todos.map((todo, index) => (
          <li key={index}>
            {todo.title} - {todo.completed ? "Completed" : "Pending"}
          </li>
        ))}
      </ul>
      <input
        type="text"
        value={newToDo}
        onChange={(e) => setNewToDo(e.target.value)}
        placeholder="Add a new task"
      />
      <button onClick={handleAddToDo}>Add ToDo</button>
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
        event.type === "statefile_updated" ||
        event.type === "schema_updated" ||
        event.type === "statefile_created"
      ) {
        console.log("State file updated:", event);
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
      <ToDoList />
    </ApolloProvider>
  );
};

export default App;
