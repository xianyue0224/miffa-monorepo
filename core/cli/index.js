#!/usr/bin/env node

// 外部模块
const semver = require("semver")
const pathExists = require("path-exists").sync
const fs = require("fs-extra")

// 内部模块
const pkg = require("./package.json")
const { warn, error, info, notice } = require("@miffa/log")

// Node.js内置模块
const process = require("node:process")
const path = require("node:path")


const userHome = require("node:os").homedir()
const env = process.env

// 脚手架初始化流程
async function core() {
    notice(`v ${pkg.version}`)
    try {
        checkUserHome()
        checkEnv()
        checkNodeVersion()
        await checkCliUpdate()
    } catch (e) {
        error(e.message)
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