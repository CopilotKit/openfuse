// Strips GPU fallback libraries that only matter on hardware without a usable
// GPU. Chromium falls back to its software rasterizer when these are missing,
// which is slower but keeps the app rendering.
const fs = require("node:fs");
const path = require("node:path");

const UNUSED = new Set([
  "libvk_swiftshader.so",
  "libvulkan.so.1",
  "vk_swiftshader_icd.json",
  "libvk_swiftshader.dylib",
  "vk_swiftshader.dll",
  "vulkan-1.dll",
]);

function strip(directory, removed) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      strip(full, removed);
    } else if (entry.isFile() && UNUSED.has(entry.name)) {
      fs.rmSync(full, { force: true });
      removed.push(full);
    }
  }
}

module.exports = async function afterPack(context) {
  const removed = [];
  strip(context.appOutDir, removed);
  for (const file of removed) {
    console.log(`  • trimmed ${path.relative(context.appOutDir, file)}`);
  }
};
