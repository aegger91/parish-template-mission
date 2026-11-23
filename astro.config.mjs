// @ts-check
import { defineConfig } from "astro/config"
import react from "@astrojs/react"
import tailwindcss from "@tailwindcss/vite"

// Plain static output: every page is a folder with an index.html, plus 404.html.
// Set `base` if the site is served from a sub-folder.
export default defineConfig({
  output: "static",
  trailingSlash: "always",
  build: { format: "directory" },
  server: { port: 4637, host: true },
  devToolbar: { enabled: false },
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
})
