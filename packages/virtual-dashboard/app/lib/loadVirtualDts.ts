import type { Schema_Index } from "@kube/structype";

export async function loadVirtualLibsIntoMonaco(
  monaco: typeof import("monaco-editor"),
  rootPath: string,
  schema: Schema_Index
) {
  // Load all .d.ts of each package
  const dtsSources = await import.meta.glob(
    [
      "../../node_modules/@kube/structype/dist/*.d.ts",
      "../../node_modules/@kube/structype-graphql/dist/*.d.ts",
      "../../node_modules/@kube/virtual/dist/*.d.ts",
    ],
    { query: "?raw", import: "default", eager: true }
  );

  const dtsContent = Object.entries(dtsSources).map(([path, content]) => ({
    filePath: path.replace("../../", rootPath),
    content: content as string,
  }));

  // Load package.json of each package

  const packagesMetadata = await import.meta.glob(
    [
      "../../node_modules/@kube/structype/package.json",
      "../../node_modules/@kube/structype-graphql/package.json",
      "../../node_modules/@kube/virtual/package.json",
    ],
    { eager: true }
  );

  const packagesIndexContent = Object.values(packagesMetadata).map(
    ({ name, types }: any) => ({
      filePath: `${rootPath}node_modules/${name}/index.d.ts`,
      content: `export * from "./${types}";`,
    })
  );

  // Set extra libs in Monaco, for .d.ts and packages types index

  const virtualStateDts = `
    import type { ResolversFromSchemaIndex } from "@kube/virtual";
    declare global {
      type __VirtualSchema = ${JSON.stringify(schema)};
      function VirtualState(input: ResolversFromSchemaIndex<__VirtualSchema>): void;
    }`;

  const virtualStateDtsUri = monaco.Uri.parse(`${rootPath}__virtual.d.ts`);

  const virtualStateDtsModel = monaco.editor.getModel(virtualStateDtsUri);
  if (virtualStateDtsModel) {
    virtualStateDtsModel.setValue(virtualStateDts);
  } else {
    monaco.editor.createModel(
      virtualStateDts,
      "typescript",
      monaco.Uri.parse(`${rootPath}__virtual.d.ts`)
    );
  }

  monaco.languages.typescript.typescriptDefaults.setExtraLibs([
    ...dtsContent,
    ...packagesIndexContent,
  ]);
}
