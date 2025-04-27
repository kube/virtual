export default VirtualState(
  {
    formal: { type: "Boolean" },
    firstName: { type: "String" },
    age: { type: "Number" },
  },
  (opts) => ({
    resolvers: {
      Query: {
        // Write your resolvers here
        hello: () => `${opts.formal ? "Hello" : "Hi"} ${opts.firstName}! You are ${opts.age} years old.`,
        world: () => opts.age
      },
    },
  })
);
