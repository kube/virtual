import { program } from "@commander-js/extra-typings";
import { mergeTypeDefs } from "@graphql-tools/merge";
import { toStructype } from "@kube/structype-graphql";
import { print } from "graphql";

import { serialize } from "@kube/structype";
import { readFileSync, watchFile, writeFileSync } from "fs";

program.name("vgql").description("Virtual CLI").version("0.0.1");

program
  .command("generate <schemaFiles...>")
  .option("-w, --watch", "watch mode")
  .requiredOption("-o, --out <path>", "output path")
  .description("Generate Structype from GraphQL Schema")
  .action((schemaFiles, options) => {
    async function transpileAndWrite() {
      try {
        const filesContent = schemaFiles.map((fileName) =>
          readFileSync(fileName, "utf-8")
        );
        const mergedSchema = print(mergeTypeDefs(filesContent));
        const structype = toStructype(mergedSchema);
        const serialized = serialize(structype, "ts");

        writeFileSync(options.out, serialized, "utf-8");
        console.log(
          `>> Successfully transpiled GraphQL to Structype (${options.out})`
        );
      } catch (error) {
        console.log(`>> Error while transpiling GraphQL to Structype`);
        console.error(error);
      }
    }

    transpileAndWrite();

    if (options.watch) {
      // TODO: Watcher should not be done like that
      schemaFiles.forEach((fileName) =>
        watchFile(fileName, { interval: 200 }, transpileAndWrite)
      );
    }
  });

program.parse(process.argv);
