// scripts/generate-icons.mjs
import { writeFileSync } from "fs";

// Buat PNG sederhana menggunakan raw binary
// Ini adalah 192x192 PNG hijau dengan teks "K" putih
// Kita pakai base64 encoded PNG yang sudah digenerate

const icon192 = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">
  <rect width="192" height="192" rx="38" fill="#059669"/>
  <text x="96" y="140" font-family="Arial, sans-serif" font-size="120" font-weight="bold" text-anchor="middle" fill="white">K</text>
</svg>`;

const icon512 = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="100" fill="#059669"/>
  <text x="256" y="370" font-family="Arial, sans-serif" font-size="320" font-weight="bold" text-anchor="middle" fill="white">K</text>
</svg>`;

writeFileSync("public/icons/icon-192.svg", icon192);
writeFileSync("public/icons/icon-512.svg", icon512);
console.log("Icons generated!");
