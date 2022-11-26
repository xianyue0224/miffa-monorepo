#!/usr/bin/env node

const { initConfig } = require("./initConfig")
const { warn, error } = require("@miffa/log")
const { initCli } = require("./initCli")
const process = require("node:process")
const pkg = require("./package.json")
const semver = require("semver")


// 脚手架初始化流程
async function main() {
    try {
        initConfig()
        console.log(process.miffa)
        checkNodeVersion()
        await checkCliUpdate()
        initCli()
    } catch (e) {
        error(e.message, "", true)
    }
}

// 检查脚手架更新
async function checkCliUpdate() {
    const latestVersion = require('latest-version')
    const latest = await latestVersion(pkg.name)
    if (latest && semver.gt(latest, pkg.version)) {
        warn(`你正在使用 v${pkg.version} 版本，有更高版本可用，请使用这个命令更新：npm install miffa@${latest} -g`)
    }
}

// 检查当前Node版本
function checkNodeVersion() {
    // 获取当前版本号
    const cur = process.version

    // 比对最低版本号
    const lowest = process.miffa.lowest_node_version

    if (!semver.gte(cur, lowest)) {
        throw new Error(`你必须运行 v${lowest} 版本以上的 Node.js 才能运行 Miffa！`)
    }
}

main()

module.exports = {};