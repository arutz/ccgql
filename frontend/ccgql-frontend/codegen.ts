import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "schema/schema.graphql",
  documents: "./src/app/graphql/operations/**/*.ts",
  overwrite: true,
  generates: {
    "./src/generated/graphql.ts": {
      plugins: ["typescript", "typescript-operations", "typescript-apollo-angular"],
      config: {
        scalars: {
          Date: "string",
        },
      },
    },
  },
  ignoreNoDocuments: true,
};
export default config;
