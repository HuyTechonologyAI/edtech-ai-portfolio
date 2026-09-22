import { execSync } from "child_process";
import fs from "fs";
import path from "path";

console.log("==================================================");
console.log("CI QUALITY GATE: LINT VALIDATION (RATCHET POLICY)");
console.log("==================================================");

// 1. Lint Approved Modern / Corporate V2 Scope
console.log("\n[1/2] Checking Approved Modern V2 Scope...");
const modernScope = [
  "src/components/v2",
  "src/app/page.tsx",
  "src/app/v2",
];

try {
  execSync(`npx eslint ${modernScope.join(" ")} --max-warnings 0`, { stdio: "inherit" });
  console.log("✔ Approved modern V2 scope: PASS (0 errors, 0 warnings).");
} catch (err) {
  console.error("✖ Modern V2 scope lint check failed!");
  process.exit(1);
}

// 2. Lint Changed JS/TS Files ("Touch it -> Clean it")
console.log("\n[2/2] Checking Changed JS/TS Files...");
const baseRef = process.env.GITHUB_BASE_REF || process.env.BASE_REF || "main";
let diffTarget = "";

try {
  execSync(`git rev-parse --verify origin/${baseRef}`, { stdio: "pipe" });
  diffTarget = `origin/${baseRef}`;
} catch {
  try {
    execSync(`git rev-parse --verify ${baseRef}`, { stdio: "pipe" });
    diffTarget = baseRef;
  } catch {
    diffTarget = "HEAD~1";
  }
}

console.log(`Git diff target: ${diffTarget}`);

let changedFiles = [];
try {
  const diffOutput = execSync(`git diff --name-only --diff-filter=d ${diffTarget}...HEAD`, { encoding: "utf8" });
  changedFiles = diffOutput
    .split("\n")
    .map((f) => f.trim())
    .filter((f) => f.length > 0);
} catch (e) {
  console.log(`Notice: git diff failed against ${diffTarget}, checking uncommitted changes...`);
  try {
    const statusOutput = execSync("git status --porcelain", { encoding: "utf8" });
    changedFiles = statusOutput
      .split("\n")
      .map((line) => line.substring(3).trim())
      .filter((f) => f.length > 0);
  } catch {
    changedFiles = [];
  }
}

const sourceExtensions = [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"];
const candidateFiles = changedFiles.filter((file) => {
  const ext = path.extname(file).toLowerCase();
  if (!sourceExtensions.includes(ext)) return false;
  if (
    file.startsWith(".next/") ||
    file.startsWith("node_modules/") ||
    file.startsWith("out/") ||
    file.startsWith("build/") ||
    file.startsWith("scripts/")
  ) {
    return false;
  }
  return fs.existsSync(file);
});

if (candidateFiles.length === 0) {
  console.log("✔ No changed application JS/TS files to lint.");
} else {
  console.log(`Found ${candidateFiles.length} changed JS/TS file(s) to validate:`);
  candidateFiles.forEach((f) => console.log(`  - ${f}`));
  try {
    execSync(`npx eslint ${candidateFiles.join(" ")} --max-warnings 0`, { stdio: "inherit" });
    console.log("✔ All changed JS/TS files: PASS (0 errors, 0 warnings).");
  } catch (err) {
    console.error("✖ Changed files lint check failed!");
    process.exit(1);
  }
}

console.log("\n==================================================");
console.log("✔ Quality Gate Protected & Changed Scope: ALL PASSED");
console.log("==================================================");
