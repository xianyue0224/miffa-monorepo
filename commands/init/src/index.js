const { option, argument, resolvePackageInfo, npmInstall } = require("@miffa/helper")
const { execLocalModule } = require("./execLocalModule")
const { execNpmModule } = require("./execNpmModule")
const { debug, error } = require("@miffa/log")

function catchAsyncError(fn) {

    function exitError(err) {
        error(err.message, "", true)
    }

    return function () {
        fn.apply(this, arguments).catch(exitError)
    }
}

function catchSyncError(fn) {

    function exitError(err) {
        error(err.message, "", true)
    }

    return function () {
        try {
            fn.apply(this, arguments)
        } catch (err) {
            exitError(err)
        }
    }
}

const init = catchAsyncError(async function (projectName, a, cmdObj) {
    const { force, npmModule, localModule } = cmdObj.optsWithGlobals()
    debug(`~ init ~ localModule:${localModule}`)
    debug(`~ init ~ npmModule:${npmModule}`)
    debug(`~ init ~ force:${force}`)

    if (npmModule && localModule) {
        throw new Error(`"-lm, --localModule" 和 "-nm, --npmModule"两个选项不能同时使用！`)
    }

    if (localModule) {
        execLocalModule(projectName, force, localModule, cmdObj)
    } else if (npmModule) {
        debug("加载npm模块替换默认init处理函数")
        await execNpmModule(projectName, force, npmModule, cmdObj)
    } else {
        // 默认init命令action
        debug("执行init命令默认处理函数")
    }
})





module.exports = {
    initCmd: {
        name: "init",
        description: "初始化项目或生成组件模板",
        cmdArguments: [
            argument("[projectName]", "项目名称", "miffa-project")
        ],
        options: [
            option("-f, --force", "是否强制初始化项目", false)
        ],
        actionFn: init
    }
}