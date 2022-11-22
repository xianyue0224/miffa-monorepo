const fs = require("fs-extra")
const pkg = require("../package.json")
const { resolve } = require("node:path")

function resolvePath(relatePath) {
    return resolve(__dirname, relatePath)
}

function getPackages() {
    const workspaces = pkg.workspaces.map(s => s.replace("/*", "")).map(s => `../${s}`)
    const packagesPath = []

    workspaces.forEach(workspacePath => {
        const packages = fs.readdirSync(resolvePath(workspacePath))
        packages.forEach(package => {
            packagesPath.push(`${workspacePath}/${package}`)
        })
    })

    const packages = []

    packagesPath.forEach(path => {
        const pkg = require(resolvePath(`${path}/package.json`))
        packages.push({
            name: pkg.name,
            version: pkg.version,
            path
        })
    })

    return packages
}

module.exports = {
    getPackages
}


