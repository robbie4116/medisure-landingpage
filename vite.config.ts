import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        about: resolve(__dirname, "about.html"),
        eLaboratory: resolve(__dirname, "e-laboratory.html"),
        aida: resolve(__dirname, "aida.html"),
        emrServiceProvider: resolve(__dirname, "emr-service-provider.html"),
        privacyPolicy: resolve(__dirname, "privacy-policy.html"),
        termsAndConditions: resolve(__dirname, "terms-and-conditions.html"),
      },
    },
  },
});
