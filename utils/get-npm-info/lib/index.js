'use strict';
const axios = require("axios")
const urlJoin = require("url-join")
const semver = require("semver")

function getPackageInfo(pkgName, registry) {
    if (!pkgName) return null

    const registryUrl = registry || getDefaultRegistry()

    const pkgInfoUrl = urlJoin(registryUrl, pkgName)

    return axios.get(pkgInfoUrl)
        .then(res => res.status === 200 ? res.data : null)
        .catch(err => Promise.reject(err))
}

function getDefaultRegistry(isOrg = false) {
    return isOrg ? "https://registry.npmjs.org" : "https://registry.npmmirror.com"
}

async function getVersions(pkgName, registry) {
    const data = await getPackageInfo(pkgName, registry)
    return data ? Object.keys(data.versions) : []
}

// 获取versions数组中大于等于baseVersion的数组集合
function getGteVersions(baseVersion, versions) {
    return versions.filter(v => semver.satisfies(v, `>=${baseVersion}`))
}

// 将一个versions数组按降序排序
function sortVersions(versions) {
    return versions.sort(semver.gt)
}

async function getLatestVersion(pkgName, registry) {
    const versions = await getVersions(pkgName, registry)
    const sorted = sortVersions(versions)
    return sorted[0]
}

module.exports = {
    getPackageInfo,
    getVersions,
    getLatestVersion
}
