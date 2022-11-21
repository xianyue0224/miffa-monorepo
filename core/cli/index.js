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

// 脚手架初始化流程
async function core() {
    notice(`v ${pkg.version}`)

    try {
        checkUserHome()
        checkEnv()
        checkNodeVersion()
        await checkCliUpdate()
        initCommander()
    } catch (e) {
        error(e.message)
    }
}

// 脚手架初始化
function initCommander() {
    program
        .name("Miffa")
        .usage("<command> [options]")
        .description("欢迎使用 Miffa 🚀🚀~")
        .version(chalk.cyan.bold(`当前版本为 v${pkg.version}`), "-v, --version", "查看当前版本")
        .option("-d, --debug", "是否开启调试模式", false)
        .option("-tp, --targetPath <targetPath>", "是否使用本地调试文件", "")

    program
        .command("init [projectName]")
        .option("-f, --force", "是否强制初始化项目", false)
        .description("初始化项目")
        .action(require("@miffa/exec"))


    // 当输入未知命令时的处理函数
    program.on("command:*", function (command) {
        error(`未知命令 ${command}`)
        const availableCommands = this.commands.map(command => command._name)
        info(`可用命令：${availableCommands.join("，")}，help`)
    })

    // 控制debug模式
    program.on("option:debug", function () {
        if (this.opts().debug) {
            env.CLI_DEBUG = this.opts().debug
            debug("调试模式已开启！")
        }
    })

    // 如果使用本地调试文件，则将文件的路径添加到环境变量中
    program.on("option:targetPath", function () {
        env.CLI_TARGET_PATH = this.opts().targetPath
    })

    program.parse(argv)
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

    // 将缓存路径转换为绝对路径
    env.CLI_CACHE_PATH = path.join(userHome, env.CLI_CACHE_PATH)
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