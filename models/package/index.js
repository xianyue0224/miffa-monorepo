class Package {
    constructor(options) {
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
    getRootFilePath() { }
}

module.exports = Package