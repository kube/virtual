export default VirtualState({
  options: {
    Toto: { type: "Boolean" },
    Something: { type: "String" },
    SomethingElse: { type: "Number" },
  },
  resolvers: {
    Query: {
      // Write your resolvers here
      hello: () => "Hello 42",
    },
  },
});
