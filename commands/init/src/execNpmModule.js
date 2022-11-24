const path = require("node:path")
const { resolvePackageInfo, npmInstall } = require("@miffa/helper")
const _ = require("lodash")
const { debug, error } = require("@miffa/log")
const packageJson = require('package-json');
const process = require("node:process")

async function execNpmModule(projectInfo, npmModule) {
    // 解析npmModule字符串得到包名以及版本号
    const info = resolvePackageInfo(npmModule)
    // 通过第三方模块去获取package信息，如果获取失败说明传入的npmModule字符串有问题
    const pkg = await packageJson(info.name, { version: info.version })
    // 根据得到的package信息拼接出缓存文件夹名
    const cacheName = `${pkg.name}@${pkg.version}`
    debug(`cacheName:${cacheName}`)

    // 检查缓存
    const config = process.miffa
    let cache = config.init_node_modules.find(i => i.name === cacheName)
    // 缓存中没有，下载、并加入缓存
    if (!cache) {
        debug(`在缓存中找不到 ${cacheName} 模块，开始下载……`)
        // 下载、加入到缓存
        try {
            await npmInstall({
                name: pkg.name,
                version: pkg.version,
                path: path.join(config.cache_path, cacheName)
            })
        } catch (err) {
            error(err.message, "脚手架默认从淘宝镜像https://registry.npmmirror.com/上下载npm包，下载失败可能是网络问题，也有可能你要下载的包未同步至淘宝镜像，可以过一会再试试。", true)
        }

        debug("下载完成，写入缓存记录……")
        cache = {}
        cache.name = cacheName
        cache.path = path.join(config.cache_path, `/${cacheName}/node_modules/${pkg.name}`)
        config.init_node_modules = [...config.init_node_modules, cache]
    }

    debug(`读取缓存中的${cacheName} 模块作为init命令的处理函数执行……`)

    // 加载模块并执行
    const myModule = require(cache.path)

    if (!_.isFunction(myModule)) {
        throw new Error(`根据你给定的npm模块名称下载到了一个模块，但该模块默认导出的不是一个函数，只有当模块以 "module.exports = 一个函数" 的方式导出内容时才能成功替换原来的init命令处理函数。`)
    }

    try {
        myModule.call(this, projectInfo)
    } catch (err) {
        throw new Error(`你提供的模块在执行过程中出现了错误，这是错误信息：${err.message}`)
    }
}

module.exports = { execNpmModule }