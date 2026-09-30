import { readdirSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const sourceDirectory = "src/lib";
const tests = readdirSync(sourceDirectory).filter(name => name.endsWith(".test.ts"));
const outputDirectory = ".next/unit-tests";
mkdirSync(outputDirectory, { recursive: true });

function run(args) {
  const result = spawnSync(process.execPath, args, { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run([
  "node_modules/typescript/bin/tsc", "--target", "ES2022",
  "--module", "commonjs", "--moduleResolution", "node",
  "--esModuleInterop", "--skipLibCheck", "--strict",
  "--outDir", outputDirectory,
  ...tests.map(name => path.join(sourceDirectory, name)),
]);
run(["--test", ...tests.map(name => path.join(outputDirectory, name.replace(/\.ts$/, ".js")))]);
