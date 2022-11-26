#!/usr/bin/env node

const { warn, error } = require("@miffa/log")
const { getConfig, catchAsyncError } = require("@miffa/helper")
const { initCli } = require("./initCli")
const process = require("node:process")
const pkg = require("./package.json")
const semver = require("semver")


// 脚手架初始化流程
const main = catchAsyncError(async () => {
    checkNodeVersion()
    await checkCliUpdate()
    initCli()
})

// 检查脚手架更新
const checkCliUpdate = catchAsyncError(async () => {
    const latestVersion = require('latest-version')
    const latest = await latestVersion(pkg.name)
    if (latest && semver.gt(latest, pkg.version)) {
        warn(`你正在使用 v${pkg.version} 版本，有更高版本可用，请使用这个命令更新：npm install miffa@${latest} -g`)
    }
})

// 检查当前Node版本
function checkNodeVersion() {
    // 获取当前版本号
    const cur = process.version

    // 最低版本号
    const lowest = getConfig().lowest_node_version

    if (!semver.gte(cur, lowest)) {
        throw new Error(`你必须运行 v${lowest} 版本以上的 Node.js 才能运行 Miffa！`)
    }
}

main()

module.exports = {};