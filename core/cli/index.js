#!/usr/bin/env node

// 外部模块
const semver = require("semver")
const pathExists = require("path-exists").sync
const fs = require("fs-extra")
const { Command } = require("commander")

// 内部模块
const pkg = require("./package.json")
const { warn, error, info, notice, debug, chalk } = require("@miffa/log")
const { registerCommand } = require("@miffa/helper")

// Node.js内置模块
const process = require("node:process")
const path = require("node:path")

// 环境变量
const env = process.env

// 新建脚手架实例
const program = new Command()

// 脚手架初始化流程
async function core() {
    notice(`v ${pkg.version}`)

    try {
        initConfig()
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

    registerCommand.call(program, require("@miffa/init"))

    // 当输入未知命令时的处理函数
    program.on("command:*", function (command) {
        error(`未知命令 ${command}`)
        const availableCommands = this.commands.map(command => command._name)
        info(`可用命令：${availableCommands.join("，")}，help`)
    })

    // 控制debug模式
    program.on("option:debug", function () {
        if (this.opts().debug) {
            env.MIFFA_DEBUG = this.opts().debug
            debug("调试模式已开启！")
        }
    })

    program.parse(process.argv)
}

// 检查脚手架更新
async function checkCliUpdate() {
    const latestVersion = require('latest-version')
    const latest = await latestVersion(pkg.name)
    if (latest && semver.gt(latest, pkg.version)) {
        warn(`你正在使用 v${pkg.version} 版本，有更高版本可用，请使用这个命令更新：npm install miffa@${latest} -g`)
    }
}

// 初始化脚手架配置
function initConfig() {
    // 先获取用户主目录
    const homedir = require("node:os").homedir()
    if (!homedir || !fs.pathExistsSync(homedir)) {
        throw new Error("无法访问到用户主目录！")
    }

    // 配置文件绝对路径
    const configFilePath = path.resolve(homedir, "miffa.config.json")

    // 如果配置文件不存在就生成一个
    if (!fs.pathExistsSync(configFilePath)) {
        fs.outputJSONSync(configFilePath, require("./miffa.config.json"))
    }

    // 读取配置文件里面的内容
    const config = require(configFilePath)

    // 将配置保存到环境变量中
    for (const key in config) {
        env[`MIFFA_${key.toUpperCase()}`] = config[key]
    }

    // 将配置文件绝对路径保存到环境变量中
    env.MIFFA_CONFIG_FILE_PATH = configFilePath

    // 将缓存目录绝对路径保存到环境变量中
    env.MIFFA_CACHE_DIR_PATH = path.resolve(homedir, config.default_cache_dir)
}

// 检查当前Node版本
function checkNodeVersion() {
    // 获取当前版本号
    const cur = process.version

    // 比对最低版本号
    const lowest = env.MIFFA_LOWEST_NODE_VERSION

    if (!semver.gte(cur, lowest)) {
        throw new Error(`你必须运行 v${lowest} 版本以上的 Node.js 才能运行 Miffa！`)
    }
}

core()

module.exports = {};