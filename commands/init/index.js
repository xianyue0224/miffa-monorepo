const { option, argument, resolvePackageInfo, npmInstall, getConfig } = require("@miffa/helper")
const { debug, error } = require("@miffa/log")
const process = require("node:process")
const path = require("node:path")
const fs = require("fs-extra")

async function init(projectName, { force, localPath, npmPackage }) {
    if (localPath && npmPackage) {
        throw new Error("-lp 和 -np 选项不能同时使用！")
    }

    const self = this

    if (localPath) {
        execLocalModule(projectName, force, localPath, self)
    } else if (npmPackage) {
        await execRemoteModule(projectName, force, npmPackage, self)
    } else {
        // 默认init命令action
        console.log("🚀 ~ init ~ force", force)
        console.log("🚀 ~ init ~ projectName", projectName)
        console.log(process.env)
    }
}

function execLocalModule(projectName, force, localPath, self) {
    // 加载本地模块
    if (path.isAbsolute(localPath)) {
        require(localPath).call(self, projectName, force)
    } else {
        require(require('resolve-from')(process.cwd(), localPath)).call(self, projectName, force)
    }
}

async function execRemoteModule(projectName, force, npmPackage, self) {
    // 加载远程模块
    // 先从np选项中获取包的名字和版本信息 { name : "vue" , version : "3.0.0" }
    const info = await resolvePackageInfo(npmPackage)

    // 查看是否有缓存
    const config = getConfig()
    let cache = config.init_node_modules.find(i => i.cacheName === info.cacheName)
    if (!cache) {
        debug(`在缓存中找不到 ${info.cacheName} 模块，开始下载……`)
        // 下载、加入到缓存
        try {
            await npmInstall({
                name: info.name,
                version: info.version,
                path: path.join(process.env.MIFFA_CACHE_DIR_PATH, info.cacheName)
            })
        } catch (err) {
            error(err.message, true)
        }

        debug("下载完成，写入缓存记录……")
        cache = {}
        cache.cacheName = info.cacheName
        cache.path = path.join(process.env.MIFFA_CACHE_DIR_PATH, `/${info.cacheName}/node_modules/${info.name}`)
        config.init_node_modules.push(cache)
        fs.outputJSONSync(process.env.MIFFA_CONFIG_FILE_PATH, config)
    }

    debug(`读取缓存中的${info.cacheName} 模块作为init命令的处理函数执行……`)

    // 加载模块并执行
    require(cache.path).call(self, projectName, force)
}

module.exports = {
    initCmd: {
        name: "init",
        description: "初始化项目",
        cmdArguments: [
            argument("[projectName]", "项目名称", "miffa-project")
        ],
        options: [
            option("-f, --force", "是否强制初始化项目", false),
            option("-lp, --localPath <localPath>", "使用本地npm模块导出的方法作为init命令的处理函数"),
            option("-np, --npmPackage <npmPackage>", "使用远程npm模块导出的方法作为init命令的处理函数")
        ],
        actionFn: init
    }
}