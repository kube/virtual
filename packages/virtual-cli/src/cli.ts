import { program } from "@commander-js/extra-typings";
import { mergeTypeDefs } from "@graphql-tools/merge";
import { toStructype } from "@kube/structype-graphql";
import { print } from "graphql";

import { Schema_Index, serialize } from "@kube/structype";
import { readFileSync, watchFile, writeFileSync } from "fs";
import { createServer } from "http";

// TODO: Rewrite for better control flow and type safety
async function compile(
  schemaFiles: string[],
  options: { out?: string; watch?: boolean }
) {
  let output: { schema: Schema_Index };

  try {
    async function transpileAndWrite() {
      // Read and convert GraphQL Schema to Structype
      const filesContent = schemaFiles.map((fileName) =>
        readFileSync(fileName, "utf-8")
      );
      const mergedSchema = print(mergeTypeDefs(filesContent));
      const structypeSchema = toStructype(mergedSchema);

      // Write to file
      if (options.out) {
        const serialized = serialize(structypeSchema, "ts");
        writeFileSync(options.out, serialized, "utf-8");
        console.log(
          `>> Successfully transpiled GraphQL to Structype (${options.out})`
        );
      }
      return structypeSchema;
    }

    const schema = await transpileAndWrite();
    output = { schema };

    if (options.watch) {
      // TODO: Watcher should not be done like that
      schemaFiles.forEach((fileName) =>
        watchFile(fileName, { interval: 200 }, transpileAndWrite)
      );
    }

    return output;
  } catch (error) {
    console.log(`>> Error while transpiling GraphQL to Structype`);
    console.error(error);
    throw error;
  }
}

program.name("vgql").description("Virtual CLI").version("0.0.1");

program
  .command("generate <schemaFiles...>")
  .option("-w, --watch", "watch mode")
  .requiredOption("-o, --out <path>", "output path")
  .description("Generate Structype from GraphQL Schema")
  .action((schemaFiles, options) => {
    compile(schemaFiles, {
      out: options.out,
      watch: options.watch,
    });
  });

program
  .command("serve <schemaFiles...>")
  .description("Serve Structype as GraphQL")
  .option("-o, --out <path>", "output path")
  .action(async (schemaFiles, options) => {
    const { schema } = await compile(schemaFiles, {
      out: options.out,
      watch: true,
    });

    const server = createServer((_req, res) => {
      // Need to:
      // 1. Create a VirtualServer
      // 2. Serve <VirtualDashboard /> component bound to it
      console.log({ schema });
      res.end("In development.");
    });

    server.listen(4000, () => {
      console.log(">> Server is running on http://localhost:4000");
    });
  });

program.parse(process.argv);
