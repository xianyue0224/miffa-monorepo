#!/usr/bin/env node

// 外部模块
const semver = require("semver")
const fs = require("fs-extra")
const { Command } = require("commander")

// 内部模块
const pkg = require("./package.json")
const { warn, error, info, notice, debug, chalk } = require("@miffa/log")
const { getConfig, getUserHomePath, setEnv, getConfigFilePath } = require("@miffa/helper")
const { initCli } = require("./initCli")

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
        initCli()
    } catch (e) {
        error(e.message)
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

// 初始化脚手架配置
function initConfig() {
    const config = getConfig()

    // 将配置保存到环境变量中
    for (const key in config) {
        setEnv(key.toUpperCase(), config[key])
    }

    // 将缓存目录绝对路径保存到环境变量中
    setEnv("cache_dir_path", path.join(getUserHomePath(), config.default_cache_dir))
    // 将配置文件绝对路径保存到环境变量中
    setEnv("config_file_path", getConfigFilePath())
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