import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Fix reale per "QS is not defined": sostituisce l'identificatore QS con globalThis.QS.
  define: {
    QS: "globalThis.QS",
  },
});
