// main.ts — news-image-20261119
//
// Copies the newspaper front page (entry.png) that sits next to this
// program into the output directory, as the entry image for the
// "Sum up 19 November's world news in one image" competition.
//
// The image is a front page for Thursday 19 November 2026 with four
// illustrated panels: GTA VI launches worldwide; Trump lands in China
// as Xi meets Putin; US strikes Iran as tankers burn at Hormuz; the
// World Court rules on the Myanmar genocide case.
//
// The program uses only the Node standard library, needs no network,
// and always writes the exact same bytes, so both grading runs produce
// an identical file.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Where the output goes: MAKEFUN_OUTPUT_DIR when set, /output otherwise.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outputPath = join(outputDir, "entry.png");

// The source image lives beside this file in the repository.
const here = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(here, "entry.png");

const bytes = readFileSync(sourcePath);

if (bytes.length === 0) {
  throw new Error("entry.png is empty, refusing to write an empty output");
}

// The file must really be an image: JPEG starts FF D8 FF, PNG starts
// with the 8-byte PNG signature. Anything else is not our front page.
const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
const isPng =
  bytes[0] === 0x89 &&
  bytes[1] === 0x50 &&
  bytes[2] === 0x4e &&
  bytes[3] === 0x47 &&
  bytes[4] === 0x0d &&
  bytes[5] === 0x0a &&
  bytes[6] === 0x1a &&
  bytes[7] === 0x0a;

if (!isJpeg && !isPng) {
  throw new Error(
    "entry.png does not start with a JPEG or PNG magic number",
  );
}

// A whole JPEG ends with the end-of-image marker FF D9; a truncated
// copy would fail the gate even if its header looked fine.
if (isJpeg) {
  const last = bytes.subarray(-2);
  if (last[0] !== 0xff || last[1] !== 0xd9) {
    throw new Error("entry.png is a truncated JPEG (no end-of-image marker)");
  }
}

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, bytes);

console.log(`Wrote ${bytes.length} bytes to ${outputPath}`);
