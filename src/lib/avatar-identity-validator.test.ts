import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

interface ParsedEmployee {
  id: string;
  code: string;
  name: string;
  gender: "Nam" | "Nữ";
  department: string;
  avatarPath: string;
}

function loadWorkforceData(): { employees: ParsedEmployee[]; departments: string[] } {
  const filePath = path.resolve(process.cwd(), "src/data/ai-workforce-63.ts");
  const content = fs.readFileSync(filePath, "utf8");

  // Extract departments
  const deptMatch = content.match(/ADMINCENTER_DEPARTMENTS\s*=\s*\[([\s\S]*?)\];/);
  const departments: string[] = [];
  if (deptMatch) {
    const rawDepts = deptMatch[1].match(/"([^"]+)"/g) || [];
    departments.push(...rawDepts.map((d) => d.replace(/"/g, "")));
  }

  // Extract employees
  const empRegex = /{\s*id:\s*"(emp_\d+)",\s*code:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*gender:\s*"(Nam|Nữ)",[\s\S]*?department:\s*"([^"]+)",[\s\S]*?avatarPath:\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  const employees: ParsedEmployee[] = [];

  while ((m = empRegex.exec(content)) !== null) {
    employees.push({
      id: m[1],
      code: m[2],
      name: m[3],
      gender: m[4] as "Nam" | "Nữ",
      department: m[5],
      avatarPath: m[6],
    });
  }

  return { employees, departments };
}

test("Avatar Identity Validator - Full 63 Workforce Persona & Asset Integrity", async (t) => {
  const { employees, departments } = loadWorkforceData();

  await t.test("Verify exactly 63 distinct employees and 8 core departments", () => {
    assert.equal(employees.length, 63, "Workforce roster must have exactly 63 employees");
    assert.equal(departments.length, 8, "There must be exactly 8 departments");

    const idSet = new Set<string>();
    for (const emp of employees) {
      assert.ok(emp.id.startsWith("emp_"), `Agent ID must start with emp_, got ${emp.id}`);
      assert.ok(!idSet.has(emp.id), `Agent ID must be unique, duplicate found: ${emp.id}`);
      idSet.add(emp.id);

      assert.ok(
        departments.includes(emp.department),
        `Department ${emp.department} must belong to official 8 departments`
      );

      // Vietnamese 2-word name check
      const nameParts = emp.name.trim().split(/\s+/);
      assert.equal(
        nameParts.length,
        2,
        `Name must be exactly 2 words according to system standard: ${emp.name}`
      );
    }
    assert.equal(idSet.size, 63, "Must have exactly 63 unique Agent IDs");
  });

  await t.test("Verify gender distribution and persona configuration", () => {
    const males = employees.filter((e) => e.gender === "Nam");
    const females = employees.filter((e) => e.gender === "Nữ");

    assert.equal(males.length, 33, "Must have exactly 33 male agents");
    assert.equal(females.length, 30, "Must have exactly 30 female agents");
    assert.equal(males.length + females.length, 63, "Sum of genders must equal 63");
  });

  await t.test("Verify avatar asset existence and file integrity on disk", () => {
    const publicDir = path.resolve(process.cwd(), "public");

    for (const emp of employees) {
      assert.equal(
        emp.avatarPath,
        `/assets/workforce/${emp.id}.jpg`,
        `Avatar path for ${emp.id} must be canonical /assets/workforce/${emp.id}.jpg`
      );

      const filePath = path.join(publicDir, "assets", "workforce", `${emp.id}.jpg`);
      assert.ok(
        fs.existsSync(filePath),
        `Avatar image file must exist on disk for ${emp.id} at ${filePath}`
      );

      const stats = fs.statSync(filePath);
      assert.ok(
        stats.size >= 100000,
        `Avatar image for ${emp.id} must be intact (>100KB), got ${stats.size} bytes`
      );
    }
  });
});
