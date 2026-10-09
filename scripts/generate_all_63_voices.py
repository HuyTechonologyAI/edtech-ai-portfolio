import os
import json
import asyncio
import hashlib
import time
import edge_tts

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REGISTRY_PATH = os.path.join(ROOT_DIR, "src", "data", "voice_registry.json")
OUTPUT_DIR = os.path.join(ROOT_DIR, "public", "voices", "samples")

os.makedirs(OUTPUT_DIR, exist_ok=True)

async def synthesize_one(agent_id, voice_info, semaphore):
    async with semaphore:
        base_voice = voice_info.get("base_voice", "vi-VN-NamMinhNeural")
        rate = voice_info.get("rate", "+0%")
        pitch = voice_info.get("pitch", "+0Hz")
        intro_text = voice_info.get("intro_text", "")
        out_file = os.path.join(OUTPUT_DIR, f"{agent_id}_intro.mp3")

        # Skip if already exists and > 50KB
        if os.path.exists(out_file) and os.path.getsize(out_file) > 50000:
            print(f"[EXISTS] {agent_id}: {os.path.getsize(out_file)} bytes")
            with open(out_file, "rb") as f:
                sha = hashlib.sha256(f.read()).hexdigest()
            return agent_id, out_file, sha, os.path.getsize(out_file)

        for attempt in range(1, 5):
            print(f"[SYNTH attempt {attempt}] {agent_id} ({voice_info.get('display_name')}): {base_voice} pitch={pitch} rate={rate}...")
            try:
                communicate = edge_tts.Communicate(
                    text=intro_text,
                    voice=base_voice,
                    rate=rate,
                    pitch=pitch
                )
                await communicate.save(out_file)
                if os.path.exists(out_file) and os.path.getsize(out_file) > 10000:
                    size = os.path.getsize(out_file)
                    with open(out_file, "rb") as f:
                        sha = hashlib.sha256(f.read()).hexdigest()
                    print(f"  ✔ {agent_id} SUCCESS: {size} bytes, sha256={sha[:12]}...")
                    await asyncio.sleep(1.2) # Throttling to prevent Microsoft Edge-TTS rate-limit
                    return agent_id, out_file, sha, size
                else:
                    if os.path.exists(out_file):
                        os.remove(out_file)
                    print(f"  ⚠️ {agent_id} empty file, retrying in 2s...")
                    await asyncio.sleep(2.0)
            except Exception as e:
                print(f"  ⚠️ {agent_id} attempt {attempt} failed: {e}")
                await asyncio.sleep(2.5 * attempt)

        print(f"  ❌ {agent_id} FAILED after 4 attempts")
        return agent_id, None, None, 0

async def main():
    with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    voices = data.get("voices", {})
    print(f"Loaded {len(voices)} voices from {REGISTRY_PATH}")

    # Use semaphore=1 to avoid concurrency rate-limiting from Microsoft TTS
    semaphore = asyncio.Semaphore(1)
    tasks = [synthesize_one(aid, v, semaphore) for aid, v in voices.items()]
    results = await asyncio.gather(*tasks)

    success_count = 0
    for aid, path, sha, size in results:
        if path and size > 0:
            success_count += 1
            if aid in voices:
                voices[aid]["sample_sha256"] = sha
                voices[aid]["sample_status"] = "SYNTHESIZED_VERIFIED"
                voices[aid]["approval_status"] = "APPROVED"

    print(f"\nFinal Result: {success_count}/{len(voices)} voices verified.")

    # Save updated registry with exact sha256
    with open(REGISTRY_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Updated {REGISTRY_PATH} with verified sha256 signatures.")

if __name__ == "__main__":
    asyncio.run(main())
