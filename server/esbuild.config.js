const esbuild = require("esbuild")
const fs = require("fs/promises")
const path = require("path")

esbuild.build({
  entryPoints: ['./src/index.ts'],
  outfile: "dist/index.js",
  platform: "node",
  target: "node14",
  bundle: true,
  minify: true,
  // plugins: [nodeExternalsPlugins()],
}).then(() => {
    return fs.mkdir(path.join(__dirname, "dist", "public"))
  })
  .then(() => {
    console.log("builded :)")
  })
  .catch((e) => {
    console.log("something went wrong...", e)
  })
