import { terser } from "rollup-plugin-terser";

const isProduction = process.env.NODE_ENV === "production";

export default ["amd", "cjs", "esm", "iife", "umd"].map(format => ({
  input: "index.js",
  output: {
    file: isProduction ? `bundle.${format}.min.js` : `bundle.${format}.js`,
    format: format,
    name: "overpassWizard"
  },
  plugins: isProduction ? [terser()] : []
}));
