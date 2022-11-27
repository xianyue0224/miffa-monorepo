const path = require("node:path")
const fs = require("node:fs")

const workspaces = require("../package.json").workspaces

const packages = []

const root = path.join(__dirname, "../")

workspaces.forEach(w => {
    if (!w.endsWith("/*")) {
        packages.push(path.join(root, w))
    } else {
        fs.readdirSync(path.join(root, w.replace("/*", "")))
            .map(i => path.join(root, w.replace("/*", ""), i))
            .forEach(i => packages.push(i))
    }
})

console.log(packages)

// require('esbuild').build({
//     entryPoints: [path.resolve(__dirname, '../cli/index.js')],
//     bundle: true,
//     outfile: 'out.js',
//     platform: "node"
// }).catch(() => process.exit(1))