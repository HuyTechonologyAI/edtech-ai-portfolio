import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

test("Directive AG-VOICE-CARD-003: Voice Card 63 Integrity & Acceptance Tests", async (t) => {
  const rootDir = process.cwd();
  const manifestPath = path.join(rootDir, "src", "data", "voice_card_63_manifest.json");
  const registryPath = path.join(rootDir, "src", "data", "voice_registry.json");
  const cardsDir = path.join(rootDir, "public", "voices", "cards");

  await t.test("VC-AT-01: Manifest file exists and conforms to schema", () => {
    assert.equal(fs.existsSync(manifestPath), true, "voice_card_63_manifest.json must exist");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    assert.equal(manifest.directive, "AG-VOICE-CARD-003");
    assert.equal(manifest.human_gate, "Mr. Huy Technology AI");
    assert.equal(manifest.total_agents, 63);
    assert.equal(Array.isArray(manifest.entries), true);
    assert.equal(manifest.entries.length, 63);
  });

  await t.test("VC-AT-02: Exactly 63 distinct agents (emp_01 to emp_63) present in manifest", () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    const agentIds = manifest.entries.map((e: { agent_id: string }) => e.agent_id);
    const uniqueIds = new Set(agentIds);
    assert.equal(uniqueIds.size, 63, "Must have exactly 63 unique agent IDs");

    for (let i = 1; i <= 63; i++) {
      const expectedId = `emp_${String(i).padStart(2, "0")}`;
      assert.equal(uniqueIds.has(expectedId), true, `Missing agent ID: ${expectedId}`);
    }
  });

  await t.test("VC-AT-03: Voice registry has card_intro metadata for all 63 agents", () => {
    const registry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
    assert.ok(registry.voices, "Registry must contain voices dictionary");

    for (let i = 1; i <= 63; i++) {
      const id = `emp_${String(i).padStart(2, "0")}`;
      const v = registry.voices[id];
      assert.ok(v, `Agent ${id} must exist in registry`);
      assert.ok(v.card_intro, `Agent ${id} must have card_intro metadata`);
      assert.equal(v.card_intro.approval_status, "APPROVED");
      assert.equal(v.card_intro.human_gate_verdict, "VERIFIED_VALID");
      assert.ok(v.card_intro.intro_text.length > 25, `Intro text for ${id} must be > 25 chars`);
      assert.equal(v.card_intro.sample_path, `/voices/cards/${id}_card.mp3`);
    }
  });

  await t.test("VC-AT-04: All 63 MP3 audio files exist in public/voices/cards and are valid size", () => {
    assert.equal(fs.existsSync(cardsDir), true, "public/voices/cards directory must exist");

    for (let i = 1; i <= 63; i++) {
      const id = `emp_${String(i).padStart(2, "0")}`;
      const filePath = path.join(cardsDir, `${id}_card.mp3`);
      assert.equal(fs.existsSync(filePath), true, `File ${id}_card.mp3 must exist on disk`);

      const stats = fs.statSync(filePath);
      // Realistic Edge-TTS MP3 files of 10-15s Vietnamese speech are 60KB - 85KB (> 40KB)
      assert.ok(stats.size > 40000, `File ${id}_card.mp3 size (${stats.size} bytes) must be > 40000 bytes`);
    }
  });

  await t.test("VC-AT-05: SHA-256 hashes in manifest match actual files on disk", () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

    for (const entry of manifest.entries) {
      const filePath = path.join(rootDir, "public", entry.card_intro_path.replace(/^\//, ""));
      const buffer = fs.readFileSync(filePath);
      const computedSha = crypto.createHash("sha256").update(buffer).digest("hex");
      assert.equal(computedSha, entry.sha256, `SHA-256 hash mismatch for ${entry.agent_id}`);
    }
  });

  await t.test("VC-AT-06: Regional accents and styles distribution conforms to 21 Bac, 21 Trung, 21 Nam", () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    const regions: Record<string, number> = { Bac: 0, Trung: 0, Nam: 0 };

    for (const entry of manifest.entries) {
      if (entry.region.includes("Bắc")) regions.Bac++;
      else if (entry.region.includes("Trung")) regions.Trung++;
      else if (entry.region.includes("Nam")) regions.Nam++;
    }

    assert.equal(regions.Bac, 21, "Must have 21 Bac voices");
    assert.equal(regions.Trung, 21, "Must have 21 Trung voices");
    assert.equal(regions.Nam, 21, "Must have 21 Nam voices");
  });
});
