# Structype

Strutype is a Schema definition library for TypeScript.

Its goal (for now) is to allow to manipulate GraphQL schemas in TypeScript, both statically (at Type-level), and at runtime.

It focuses on providing equivalent of an Intermediate Representation of a schema, and will in the future add "frontends" to simplify writing of schemas in TypeScript.

Because TypeScript and GraphQL do not always have equivalent features/semantics, Structype will first focus on providing a "safe" subset.
