const { option, argument, catchAsyncError } = require("@miffa/helper")
const { execLocalModule } = require("./execLocalModule")
const { execNpmModule } = require("./execNpmModule")
const { execDefaultInit } = require("./execDefaultInit")
const { debug, error } = require("@miffa/log")
const prompts = require("prompts")
const semver = require("semver")
const { exit } = require("node:process")
const fs = require("fs-extra")
const path = require("path")

function getTemplateList() {
    // 模板文件夹路径
    const path_to_templates_dir = path.resolve(__dirname, "../template")
    const list = fs.readdirSync(path_to_templates_dir)
    return list.map(i => ({
        title: i,
        value: path.join(path_to_templates_dir, i),
        get description() {
            const pkg = require(path.join(this.value, "package.json"))
            return pkg.description
        }
    }))
}

const init = catchAsyncError(async function (projectName, a, cmdObj) {
    const { npmModule, localModule } = cmdObj.optsWithGlobals()
    debug(`~ init ~ localModule:${localModule}`)
    debug(`~ init ~ npmModule:${npmModule}`)

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
            name: "template",
            message: "选择一个模板：",
            choices: getTemplateList()
        }
    ]

    const answer = await prompts(questions, {
        onCancel: exit
    })

    if (localModule) {
        execLocalModule(answer, localModule)
    } else if (npmModule) {
        debug("加载npm模块替换默认init处理函数")
        await execNpmModule(answer, npmModule)
    } else {
        await execDefaultInit(answer)
    }
})


module.exports = {
    initCmd: {
        name: "init",
        description: "初始化项目",
        cmdArguments: [
            argument("[projectName]", "项目名称", "miffa-project")
        ],
        options: [
            option("-f, --force", "是否强制初始化项目", false)
        ],
        actionFn: init
    }
}