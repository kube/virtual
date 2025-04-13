export default VirtualState.withOptions({
  Toto: { type: "Boolean" },
  Something: { type: "String" },
  SomethingElse: { type: "Number" }
})(options => ({
  resolvers: {
    Query: {
      // Write your resolvers here
      hello: () => "Hello!",
    },
  }
}));
