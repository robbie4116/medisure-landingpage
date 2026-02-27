import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(rootDir, "index.html"),
        about: resolve(rootDir, "about.html"),
        eLaboratory: resolve(rootDir, "e-laboratory.html"),
        eKonsulta: resolve(rootDir, "e-konsulta.html"),
        aida: resolve(rootDir, "aida.html"),
        emrServiceProvider: resolve(rootDir, "emr-service-provider.html"),
        privacyPolicy: resolve(rootDir, "privacy-policy.html"),
        termsAndConditions: resolve(rootDir, "terms-and-conditions.html"),
      },
    },
  },
});
