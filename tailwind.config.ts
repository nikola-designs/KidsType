import type { Config } from "tailwindcss";
import daisyui from "daisyui";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        sage: "#7A9E7E",
        paper: "#f7f3e9",
        ink: "#2f3a2f"
      },
      boxShadow: {
        paper: "0 18px 35px rgba(62, 76, 63, 0.15), 0 2px 8px rgba(62, 76, 63, 0.08)"
      },
      fontFamily: {
        notebook: [
          "Avenir Next Rounded",
          "Nunito",
          "Segoe Print",
          "Trebuchet MS",
          "system-ui",
          "sans-serif"
        ]
      }
    }
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["cupcake"]
  }
};

export default config;
