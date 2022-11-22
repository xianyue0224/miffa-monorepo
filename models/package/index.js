const { resolve } = require("node:path")
const fs = require("fs-extra")

class Package {
    constructor(options) {
        if (!options) {
            throw new Error("初始化 Package 类的实例必须传 options 参数！")
        }
        if (!require("@miffa/helper").isObject(options)) {
            throw new Error("Package 类构造函数的参数 options 必须为对象！")
        }
        // package路径
        this.targetPath = options.targetPath
        // package缓存路径
        this.cachePath = options.cachePath
        // package的名称及版本
        this.packageName = options.packageName
        this.packageVersion = options.packageVersion
    }

    // 判断package是否存在
    exists() { }

    // 安装package
    install() { }

    // 更新package
    update() { }

    // 获取入口文件的路径
    getIndexFilePath() {
        // 1. 获取package.json所在的目录
        const pkgDir = require("pkg-dir").sync(this.targetPath ? this.targetPath : this.cachePath)

        if (!pkgDir || !fs.pathExistsSync(pkgDir)) {
            throw new Error("无法找到入口文件路径！")
        }

        // 2. 读取package.json
        const pkgFilePath = resolve(pkgDir, "package.json") // package.json 文件路径

        if (!fs.pathExistsSync(pkgFilePath)) {
            throw new Error("无法找到入口文件路径！")
        }

        const pkg = require(pkgFilePath)

        // 3. 寻找main/lib
        if (!pkg.main) {
            throw new Error("无法找到入口文件路径！")
        }

        const indexFilePath = resolve(pkgDir, pkg.main)

        if (!fs.pathExistsSync(indexFilePath)) {
            throw new Error("入口文件不存在！")
        }

        console.log(indexFilePath)

        // 4. 路径的兼容（win/mac）
    }
}

module.exports = Package