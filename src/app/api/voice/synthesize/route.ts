import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const execAsync = promisify(exec);

// Path to voice registry
const REGISTRY_PATH = path.join(process.cwd(), "src/data/voice_registry.json");
const CACHE_DIR = path.join(process.cwd(), "public/voices/cache");

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, agent_id, rate, pitch } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing or invalid text parameter" }, { status: 400 });
    }

    const cleanText = text.slice(0, 1000).trim(); // Max 1000 chars per voice chunk

    // Load voice registry
    let voiceConfig = {
      base_voice: "vi-VN-NamMinhNeural",
      rate: rate || "+0%",
      pitch: pitch || "+0Hz",
    };

    if (fs.existsSync(REGISTRY_PATH)) {
      try {
        const regData = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf-8"));
        if (agent_id && regData.voices && regData.voices[agent_id]) {
          const v = regData.voices[agent_id];
          voiceConfig = {
            base_voice: v.base_voice || "vi-VN-NamMinhNeural",
            rate: rate || v.rate || "+0%",
            pitch: pitch || v.pitch || "+0Hz",
          };
        }
      } catch (err) {
        console.error("Failed to parse voice registry:", err);
      }
    }

    // Generate MD5 cache key
    const cacheKey = crypto
      .createHash("md5")
      .update(`${voiceConfig.base_voice}_${voiceConfig.rate}_${voiceConfig.pitch}_${cleanText}`)
      .digest("hex");

    const cacheFilePath = path.join(CACHE_DIR, `${cacheKey}.mp3`);

    // Return cached audio if exists
    if (fs.existsSync(cacheFilePath)) {
      const audioBuffer = fs.readFileSync(cacheFilePath);
      return new NextResponse(audioBuffer, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=86400",
          "X-Voice-Cached": "true",
        },
      });
    }

    // Synthesize via edge-tts CLI on NODE-01
    const edgeTtsBin = "/home/huyadmin/.local/bin/edge-tts";
    // Escape single quotes for bash
    const escapedText = cleanText.replace(/'/g, "'\\''");
    const cmd = `${edgeTtsBin} --voice='${voiceConfig.base_voice}' --rate='${voiceConfig.rate}' --pitch='${voiceConfig.pitch}' --text='${escapedText}' --write-media='${cacheFilePath}'`;

    try {
      await execAsync(cmd, { timeout: 15000 });
    } catch (execErr: unknown) {
      console.error("edge-tts synthesis failed:", execErr);
      const details = execErr instanceof Error ? execErr.message : "Execution failed";
      return NextResponse.json(
        { error: "Audio synthesis failed on NODE-01 engine", details },
        { status: 500 }
      );
    }

    if (!fs.existsSync(cacheFilePath)) {
      return NextResponse.json({ error: "Audio file not created" }, { status: 500 });
    }

    const audioBuffer = fs.readFileSync(cacheFilePath);
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
        "X-Voice-Cached": "false",
      },
    });
  } catch (error: unknown) {
    console.error("Synthesize API Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
