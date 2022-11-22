function unifiedVersion() {

}

function getBiggestVersion() {
    const packages = require("./packages").getPackages()
    const versions = packages.map(i => i.version)
    const semver = require("semver")
    versions.sort((a, b) => semver.lt(a, b) ? 1 : -1)
    return versions[0]
}

console.log(getBiggestVersion())

module.exports = {}