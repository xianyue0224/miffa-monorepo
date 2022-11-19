'use strict';

const semver = require("semver")
const colors = require("colors/safe")
const pathExists = require("path-exists").sync
const { homedir } = require("node:os")
const process = require("node:process")
const pkg = require("../package.json")
const log = require("@miffa/log")
const constant = require("./const")

module.exports = core;

function core() {
    try {
        checkPkgVersion()
        checkNodeVersion()
        checkUserHome()
    } catch (e) {
        log.error(e.message)
    }

}

function checkUserHome() {
    const userHome = homedir()
    if (!userHome || !pathExists(userHome)) {
        throw new Error(colors.red("当前登录用户主目录不存在！"))
    }
}

function checkNodeVersion() {
    // 获取当前版本号
    const cur = process.version

    // 比对最低版本号
    const lowest = constant.LOWEST_NODE_VERSION

    if (!semver.gte(cur, lowest)) {
        throw new Error(colors.red(`miffa cli 需要安装 v${lowest} 以上版本的 Node.js`))
    }
}

function checkPkgVersion() {
    log.notice("", `脚手架当前版本为 v${pkg.version}`)
}

// TODO 检查root账户启动并尝试自动降级
// async function checkRoot() {
//     const rootCheck = await import("root-check")
//     rootCheck()
// }