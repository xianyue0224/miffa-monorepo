'use strict';

let argv, userHome

// 外部模块
const semver = require("semver")
const colors = require("colors/safe")
const pathExists = require("path-exists").sync

// 内部模块
const pkg = require("../package.json")
const log = require("@miffa/log")
const constant = require("./const")

// Node.js内置模块
const { homedir } = require("node:os")
const process = require("node:process")
const path = require("node:path")


const env = process.env

function core() {
    try {
        checkPkgVersion()
        checkNodeVersion()
        checkUserHome()
        checkInputArgs()
        checkEnv()
        checkCliUpdate()
    } catch (e) {
        log.error(e.message)
    }
}

// 检查脚手架更新
function checkCliUpdate() {

}

// 检查环境变量
function checkEnv() {
    const dotenv = require("dotenv")

    // dotenv默认路径
    const dotenvPath = path.resolve(userHome, ".env")

    if (pathExists(dotenvPath)) {
        dotenv.config({
            path: dotenvPath
        })
    }

    // 将脚手架缓存路径添加到环境变量中
    env.CLI_HOME_PATH = path.join(env.USER_HOME_PATH, env.CLI_HOME ? env.CLI_HOME : constant.DEFAULT_CLI_HOME)

    log.verbose("环境变量", env)
}

// 检查入参
function checkInputArgs() {
    argv = require('minimist')(process.argv.slice(2))
    checkDebug()
}

// 检查是否为debug模式
function checkDebug() {
    process.env.LOG_LEVEL = argv.debug ? "verbose" : "info"
    log.level = process.env.LOG_LEVEL
}

// 检查当前登录用户的主目录是否存在
function checkUserHome() {
    userHome = homedir()
    if (!userHome || !pathExists(userHome)) {
        throw new Error(colors.red("当前登录用户主目录不存在！"))
    } else {
        env.USER_HOME_PATH = userHome
    }
}

// 检查当前Node版本
function checkNodeVersion() {
    // 获取当前版本号
    const cur = process.version

    // 比对最低版本号
    const lowest = constant.LOWEST_NODE_VERSION

    if (!semver.gte(cur, lowest)) {
        throw new Error(colors.red(`miffa cli 需要安装 v${lowest} 以上版本的 Node.js`))
    }
}

// 检查当前脚手架版本
function checkPkgVersion() {
    log.notice("", `脚手架当前版本为 v${pkg.version}`)
}

// TODO 检查root账户启动并尝试自动降级
// async function checkRoot() {
//     const rootCheck = await import("root-check")
//     rootCheck()
// }

module.exports = core;