import { readdirSync, mkdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const sourceDirectory = "src/lib";
const tests = readdirSync(sourceDirectory).filter(name => name.endsWith(".test.ts"));
const outputDirectory = ".next/unit-tests";
rmSync(outputDirectory, { recursive: true, force: true });
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
function findTestFiles(dir) {
  let results = [];
  const list = readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findTestFiles(fullPath));
    } else if (entry.name.endsWith(".test.js")) {
      results.push(fullPath);
    }
  }
  return results;
}

const compiledTests = findTestFiles(outputDirectory);
run(["--test", ...compiledTests]);

