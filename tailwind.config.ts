import type { Config } from "tailwindcss";

// Tailwind CSS v4 — most configuration is now in globals.css via @theme
// This file is kept for any JS-side config needed by plugins
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;
