const path = require("node:path")
const _ = require("lodash")
const { debug } = require("@miffa/log")


function execLocalModule(info, localModule) {
    if (!path.isAbsolute(localModule)) {
        localModule = path.resolve(process.cwd(), localModule)
    }

    const myModule = require(localModule)

    if (!_.isFunction(myModule)) {
        throw new Error(`从你提供的路径加载到了一个模块，但该模块默认导出的不是一个函数，你可以在这个路径${localModule}查看该模块，只有当模块以 "module.exports = 一个函数" 的方式导出内容时才能成功替换原来的init命令处理函数。`)
    }

    debug(`从 ${localModule} 加载本地模块并替换掉原来的处理函数`)

    try {
        myModule.call(this, info)
    } catch (err) {
        throw new Error(`你提供的模块在执行过程中出现了错误，这是错误信息：${err.message}`)
    }
}

module.exports = { execLocalModule }