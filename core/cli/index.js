#!/usr/bin/env node

// 外部模块
const semver = require("semver")
const pathExists = require("path-exists").sync
const fs = require("fs-extra")
const { Command } = require("commander")

// 内部模块
const pkg = require("./package.json")
const { warn, error, info, notice, debug, chalk } = require("@miffa/log")

// Node.js内置模块
const process = require("node:process")
const path = require("node:path")

// 用户主目录
const userHome = require("node:os").homedir()
// 环境变量
const env = process.env
// 命令行参数
const argv = process.argv

// 新建脚手架实例
const program = new Command()
program
    .name("Miffa")
    .usage("<command> [options]")
    .description("欢迎使用 Miffa 🚀🚀~")
    .version(chalk.cyan.bold(`当前版本为 v${pkg.version}`), "-v, --version", "查看当前版本")
    .option("-d, --debug", "是否开启调试模式", false)

program.parse(argv)

// 脚手架选项
const options = program.opts()

// 脚手架初始化流程
async function core() {
    notice(`v ${pkg.version}`)

    try {
        checkUserHome()
        checkEnv()
        checkNodeVersion()
        await checkCliUpdate()
        initCli()
    } catch (e) {
        error(e.message)
    }
}

// 脚手架初始化
function initCli() {
    // 检查是否开启了debug模式
    env.DEBUG = options.debug
    if (options.debug) {
        debug("调试模式已开启！")
    }
}

// 检查脚手架更新
async function checkCliUpdate() {
    const latestVersion = require('latest-version');
    const latest = await latestVersion(pkg.name)
    if (latest && semver.gt(latest, pkg.version)) {
        warn(`你正在使用 v${pkg.version} 版本，有更高版本可用，请使用这个命令更新：npm install miffa@${latest} -g`)
    }
}

// 检查环境变量
function checkEnv() {
    // 环境变量默认存储路径
    const envPath = path.resolve(userHome, ".miffaEnv")

    if (!pathExists(envPath)) {
        fs.copyFileSync(path.resolve(__dirname, ".miffaEnv"), envPath)
    }

    require("dotenv").config({
        path: envPath
    })
}

// 检查当前登录用户的主目录是否存在
function checkUserHome() {
    if (!userHome || !pathExists(userHome)) {
        throw new Error("当前登录用户主目录不存在！")
    }
}

// 检查当前Node版本
function checkNodeVersion() {
    // 获取当前版本号
    const cur = process.version

    // 比对最低版本号
    const lowest = env.LOWEST_NODE_VERSION

    if (!semver.gte(cur, lowest)) {
        throw new Error(`miffa cli 需要安装 v${lowest} 以上版本的 Node.js`)
    }
}

core()

module.exports = {};