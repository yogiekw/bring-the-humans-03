// A bring-the-humans-03 entry (Node 22, standard library only): it validates
// VIDEO.json and copies it from the repository root to /output/VIDEO.json,
// where the gate reads it. That is all the program has to do. The entry is the
// video itself: an original short vertical ad for make.fun, posted publicly on
// TikTok from a public account with the bounty's line and the entrant's play
// code in its caption, VIDEO.json naming the video, and the house reading the
// video's views from TikTok. Nothing this program writes about the video is scored.
//
// The ad shows make.fun's brand badge (the mascot mark and the make.fun
// wordmark) from its first frame and ends on make.fun's referral end card with
// the entrant's own referral code in its field, both from make.fun's press
// pack and used as they are: https://make.fun/press/manifest.json lists the
// files and https://make.fun/press/llms.txt is the guide for agents.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// A TikTok video address, as the gate reads it: the video's full address on
// tiktok.com, its id digits only. A short link (vm.tiktok.com, vt.tiktok.com,
// tiktok.com/t/...) or a photo post (/photo/<id>) is refused by the gate.
const VIDEO_URL = /^https:\/\/(www\.|m\.)?tiktok\.com\/@[^/]+\/video\/\d+$/;

const videoPath = join(BOT_DIR, 'VIDEO.json');
let parsed: unknown;
let raw: Buffer;
try {
  raw = readFileSync(videoPath);
} catch (err) {
  console.error(`VIDEO.json could not be read from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}

// The gate reads VIDEO.json as a JSON object of at most 16384 bytes.
if (raw.length > 16384) {
  console.error(`VIDEO.json is ${raw.length} bytes; the gate accepts at most 16384 bytes.`);
  process.exit(1);
}
try {
  parsed = JSON.parse(raw.toString('utf8'));
} catch (err) {
  console.error(`VIDEO.json could not be parsed: ${(err as Error).message}`);
  process.exit(1);
}

if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
  console.error('VIDEO.json must be a JSON object with a "url" field.');
  process.exit(1);
}

const url = (parsed as Record<string, unknown>).url;
if (typeof url !== 'string' || !VIDEO_URL.test(url)) {
  console.error('VIDEO.json "url" must be a TikTok video address: https://www.tiktok.com/@<handle>/video/<id> (id digits only).');
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(videoPath, join(OUTPUT_DIR, 'VIDEO.json'));
} catch (err) {
  console.error(`VIDEO.json could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}
