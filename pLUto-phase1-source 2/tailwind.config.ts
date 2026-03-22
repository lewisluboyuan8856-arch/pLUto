import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#08111f",
        paper: "#f4f3ef",
        mist: "#dce7e1",
        tide: "#87a3b0",
        coral: "#f28c64",
        sage: "#9ab798",
        gold: "#c7a768"
      },
      fontFamily: {
        display: ["Fraunces", "Iowan Old Style", "Georgia", "serif"],
        sans: ["Manrope", "Avenir Next", "Segoe UI", "sans-serif"]
      },
      boxShadow: {
        glow: "0 25px 80px rgba(8, 17, 31, 0.12)",
        card: "0 20px 50px rgba(8, 17, 31, 0.10)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top, rgba(242, 140, 100, 0.22), transparent 35%), radial-gradient(circle at 80% 20%, rgba(154, 183, 152, 0.25), transparent 30%), linear-gradient(135deg, rgba(8, 17, 31, 0.96), rgba(15, 34, 57, 0.92))"
      }
    }
  },
  plugins: []
};

export default config;
