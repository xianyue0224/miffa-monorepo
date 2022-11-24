const { option, argument } = require("@miffa/helper")
const { execLocalModule } = require("./execLocalModule")
const { execNpmModule } = require("./execNpmModule")
const { debug, error } = require("@miffa/log")
const prompts = require("prompts")
const semver = require("semver")
const { exit } = require("node:process")

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

    // 一些必要的检查
    if (npmModule && localModule) {
        throw new Error(`"-lm, --localModule" 和 "-nm, --npmModule"两个选项不能同时使用！`)
    }

    // 问题
    const questions = [
        {
            type: "text",
            name: "projectName",
            message: "输入项目名称：",
            initial: projectName,
            validate: v => /^[a-zA-Z]+([-][a-zA-Z0-9][a-zA-Z]*|[_][a-zA-Z0-9][a-zA-Z]*|[a-zA-Z0-9])*$/.test(v) ? true : "请输入规范的项目名称！"
        },
        {
            type: "text",
            name: "version",
            message: "输入初始版本号：",
            initial: "1.0.0",
            validate: v => semver.valid(v) ? true : "请输入正确格式的版本号！"
        },
        {
            type: "select",
            name: "branch",
            message: "选择已有的模板还是交互式定制一个模板？",
            choices: [
                { title: "选择模板", description: "模板仓库地址http://xxx.xxx.xxx", value: 1 },
                { title: "交互式定制模板", description: "还是自己来吧！", value: 2 }
            ]
        },
        {
            type: (prev, values) => values.branch === 1 ? "select" : null,
            name: "template",
            message: "选择一个模板：",
            choices: [
                { title: "Vue3全家桶", description: "Vite3_Vue3_JS_Router_Pinia_elementPlus_Scss", value: "vue3" },
                { title: "等一个模板……", description: "", value: "nothing" }
            ]
        },
        {
            type: (prev, values) => values.branch === 2 ? "select" : null,
            name: "language",
            message: "选择开发语言：",
            choices: [
                { title: "JS", description: "不要类型，爷爽就行！", value: "js" },
                { title: "TS", description: "没有类型约束的代码就像一盘散沙！", value: "ts" }
            ]
        },
        {
            type: (prev, values) => values.branch === 2 ? "select" : null,
            name: "environment",
            message: "选择代码运行环境：",
            choices: [
                { title: "浏览器", description: "ESM(import & export)", value: "fe" },
                { title: "NodeJS", description: "CJS(require & module.exports)", value: "be" }
            ]
        },
        {
            type: (prev, values) => values.branch === 2 ? "select" : null,
            name: "frame",
            message: "选择框架：",
            choices: [
                { title: "Vue 3", description: "表白组合式API~", value: "vue3" },
                { title: "Vue 2", description: "选项式API也凑合……", value: "vue2" },
                { title: "React", description: "不会React怎么进大厂？", value: "react" }
            ]
        }
    ]

    const answer = await prompts(questions, {
        onCancel: exit
    })
    console.log(answer)


    if (localModule) {
        execLocalModule(answer, localModule)
    } else if (npmModule) {
        debug("加载npm模块替换默认init处理函数")
        await execNpmModule(answer, npmModule)
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