import { readdirSync, readFileSync } from 'fs';
import { extname, join } from 'path';
import { Storyworld } from '../src/Storyworld';
import { StoryworldIO } from '../src/StoryworldIO';
import { StoryworldSerializer } from '../src/StoryworldSerializer';

const targetDir = process.argv[2];
if (!targetDir) {
  console.error('Usage: tsx tools/verify-storyworlds.ts <storyworlds-dir>');
  process.exit(1);
}

const entries = readdirSync(targetDir, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .filter((name) => ['.json', '.js'].includes(extname(name).toLowerCase()));

let okCount = 0;
let failCount = 0;

for (const filename of entries) {
  const fullPath = join(targetDir, filename);
  const text = readFileSync(fullPath, 'utf-8');
  const storyworld = new Storyworld();
  const ok = StoryworldIO.load_into_storyworld(storyworld, text);

  if (!ok) {
    console.error(`[FAIL] load: ${filename}`);
    failCount += 1;
    continue;
  }

  const serialized = StoryworldSerializer.to_project_dict(storyworld);
  const roundtrip = new Storyworld();
  const okRoundtrip = StoryworldIO.load_into_storyworld(roundtrip, JSON.stringify(serialized));

  if (!okRoundtrip) {
    console.error(`[FAIL] roundtrip: ${filename}`);
    failCount += 1;
    continue;
  }

  console.log(
    `[OK] ${filename} ` +
      `chars=${storyworld.characters.length} ` +
      `props=${storyworld.authored_properties.length} ` +
      `encounters=${storyworld.encounters.length} ` +
      `spools=${storyworld.spools.length}`
  );
  okCount += 1;
}

console.log(`Done. ok=${okCount} fail=${failCount}`);
