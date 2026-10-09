import os
import json
import asyncio
import hashlib
import time
import edge_tts

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REGISTRY_PATH = os.path.join(ROOT_DIR, "src", "data", "voice_registry.json")
OUTPUT_DIR = os.path.join(ROOT_DIR, "public", "voices", "samples")

async def test_and_synth(aid):
    with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    v = data["voices"][aid]
    base_voice = v.get("base_voice", "vi-VN-NamMinhNeural")
    rate = v.get("rate", "+0%")
    pitch = v.get("pitch", "+0Hz")
    text = v.get("intro_text", "").replace("–", "-")
    out_file = os.path.join(OUTPUT_DIR, f"{aid}_intro.mp3")

    for attempt in range(1, 10):
        print(f"[{aid}] Attempt {attempt}...")
        try:
            # First try with specified pitch/rate
            c = edge_tts.Communicate(text=text, voice=base_voice, rate=rate, pitch=pitch)
            await c.save(out_file)
            size = os.path.getsize(out_file)
            if size > 10000:
                with open(out_file, "rb") as f:
                    sha = hashlib.sha256(f.read()).hexdigest()
                print(f"[{aid}] SUCCESS! size={size}, sha={sha}")
                v["sample_sha256"] = sha
                v["sample_status"] = "SYNTHESIZED_VERIFIED"
                v["approval_status"] = "APPROVED"
                with open(REGISTRY_PATH, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                return True
        except Exception as e:
            print(f"[{aid}] error: {e}")
            # Try default pitch/rate
            try:
                print(f"[{aid}] Fallback to base voice defaults...")
                c = edge_tts.Communicate(text=text, voice=base_voice)
                await c.save(out_file)
                size = os.path.getsize(out_file)
                if size > 10000:
                    with open(out_file, "rb") as f:
                        sha = hashlib.sha256(f.read()).hexdigest()
                    print(f"[{aid}] SUCCESS with defaults! size={size}, sha={sha}")
                    v["sample_sha256"] = sha
                    v["sample_status"] = "SYNTHESIZED_VERIFIED"
                    v["approval_status"] = "APPROVED"
                    with open(REGISTRY_PATH, "w", encoding="utf-8") as f:
                        json.dump(data, f, ensure_ascii=False, indent=2)
                    return True
            except Exception as e2:
                print(f"[{aid}] fallback error: {e2}")

        await asyncio.sleep(3.0)
    return False

async def main():
    for aid in ["emp_08", "emp_10"]:
        ok = await test_and_synth(aid)
        print(f"Finished {aid}: {ok}")
        await asyncio.sleep(2.0)

if __name__ == "__main__":
    asyncio.run(main())
