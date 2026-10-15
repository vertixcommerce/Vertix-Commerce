// Temporary mitigation for GHSA-vfj7-8cjw-p6xm; upstream braces has no patched release.
// Preserve its package version so npm audit continues reporting the upstream advisory.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
const require = createRequire(import.meta.url);
const root = path.dirname(require.resolve('braces/package.json'));
const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'))).version;
if (version !== '3.0.3') throw new Error('Review braces security mitigation for new version: ' + version);
const specs = [
  {
    "file": "lib/parse.js",
    "replacements": [
      [
        "      stack.push(block);",
        "      if (stack.length >= 128) throw new SyntaxError('Brace nesting exceeds safe depth limit (128)');\n      stack.push(block);"
      ]
    ],
    "sha256": "e572166565f15fa6ad9865ae49d678218e32aabfd1b3720f6d0d43d39800d310"
  },
  {
    "file": "lib/compile.js",
    "replacements": [
      [
        "const walk = (node, parent = {}) => {",
        "const walk = (node, parent = {}, depth = 0) => {\n    if (depth >= 128) throw new SyntaxError('Brace nesting exceeds safe depth limit (128)');"
      ],
      [
        "walk(child, node)",
        "walk(child, node, depth + 1)"
      ]
    ],
    "sha256": "dc98f22eee3d511785d92a00758d5f0d48efed5f5813bdecc2de430c529b5c9f"
  },
  {
    "file": "lib/expand.js",
    "replacements": [
      [
        "const walk = (node, parent = {}) => {",
        "const walk = (node, parent = {}, depth = 0) => {\n    if (depth >= 128) throw new SyntaxError('Brace nesting exceeds safe depth limit (128)');"
      ],
      [
        "walk(child, node)",
        "walk(child, node, depth + 1)"
      ]
    ],
    "sha256": "41ccc196ebfa7b7781a634e721eb744e4e7bcb54cba427a7e3d6806a1b9e58f7"
  },
  {
    "file": "lib/stringify.js",
    "replacements": [
      [
        "const stringify = (node, parent = {}) => {",
        "const stringify = (node, parent = {}, depth = 0) => {\n    if (depth >= 128) throw new SyntaxError('Brace nesting exceeds safe depth limit (128)');"
      ],
      [
        "stringify(child)",
        "stringify(child, {}, depth + 1)"
      ]
    ],
    "sha256": "379f22d77bfa1478341ccd49c5e4267464aabcbba03558bab332aac23fc6f23a"
  }
];
const patchedHashes = {
  "lib/parse.js": "c1474875e0d0fab9c2348376b0db3f732d1af67c0daacd6412075aae1b3ad7ef",
  "lib/compile.js": "04e427633de3971a76563d99e83cddf88f4eba2a962ca082fdef72fcf06388a8",
  "lib/expand.js": "c09f19094623455d04b06af9b74e0753dc200c3ebd271acf4d6ba5b4982cdcae",
  "lib/stringify.js": "c56188e131264a467d43fc94b5922a593880e5f974a53fd5e1ab07305a7c4933"
};
for (const { file, replacements, sha256 } of specs) {
  const target = path.join(root, file);
  const original = fs.readFileSync(target, 'utf8');
  if (patchedHashes[file] === createHash('sha256').update(original).digest('hex')) continue;
  if (createHash('sha256').update(original).digest('hex') !== sha256) throw new Error('Unexpected braces source; review before patching ' + file);
  let patched = original;
  for (const [before, after] of replacements) {
    if (!patched.includes(before)) throw new Error('Missing security patch target in ' + file);
    patched = patched.replaceAll(before, after);
  }
  fs.writeFileSync(target, patched);
}
console.log('Applied bounded-depth protection to braces 3.0.3 (upstream advisory remains in audit).');
