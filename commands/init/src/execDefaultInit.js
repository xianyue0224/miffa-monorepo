const { debug, error, info } = require("@miffa/log")
const { getConfig } = require("@miffa/helper")
const prompts = require("prompts")
const fs = require("fs-extra")
const path = require("path")
const process = require("node:process")
const ora = require("ora")
const execa = require('execa')
const axios = require("axios")

const config = getConfig()
console.log("🚀 ~ config", config)

// 修改package.json文件信息
function modifyPkgJSON(newVal, path) {
    const raw = require(path)
    const newPkg = Object.assign({}, raw, newVal)
    fs.outputJSONSync(path, newPkg)
}

// 安装依赖、启动开发服务器、打开vscode
async function start(targetDir, answer) {

    function myExeca(command) {
        return execa(command, { cwd: targetDir })
    }

    try {

        await myExeca("git init")

        if (!config.github || !config.github.token) {
            error("你还未登记过你的github个人访问令牌！无法创建github仓库，你可以选择继续执行余下的步骤或者退出脚手架同时删除已经生成的项目文件。", "", true)
        }

        const res = await axios.post("https://api.github.com/user/repos",
            {
                name: "Hello-World",
                description: "This is your first repo!",
                homepage: `https://github.com/${config.github.userName}/${answer.projectName}`,
                private: false
            },
            {
                headers: {
                    Accept: "application / vnd.github + json",
                    Authorization: `Bearer ${config.github.token}`
                }
            })

        console.log(11111111111111, res)

        return

        const { stdout: registry } = await myExeca("npm config get registry")

        const spinner = ora({
            text: `正在从 ${registry} 镜像下载依赖\n`,
            prefixText: "Miffa🚀 "
        }).start()

        await myExeca(`npm install`)

        spinner.succeed("项目依赖安装完成！")


        await myExeca(`code .`)

        myExeca(`npm run dev`).stdout.pipe(process.stdout)

    } catch (err) {
        error(err.message, "", true)
    }
}

async function execDefaultInit(answer) {
    debug("执行init命令默认处理函数")

    // 目标文件夹，根据前面输入的projectName确定
    const targetDir = path.join(process.cwd(), answer.projectName)

    debug(`目标文件夹：${targetDir}`)

    // 检查目标文件夹是否是空文件夹，如果非空则提问是否清空文件夹
    if (fs.pathExistsSync(targetDir) && fs.readdirSync(targetDir).length !== 0) {
        const { clear } = await prompts({
            type: "toggle",
            name: "clear",
            message: `${targetDir} 这个目录好像有东西，需要先清空再初始化项目，确认要清空吗？`,
            initial: true,
            active: "yes",
            inactive: "no"
        })

        debug(`${clear ? "清空目录" : "不清空目录"}`)

        if (clear) {
            fs.removeSync(targetDir)
        } else {
            error("不清空目录没办法初始化项目，你可以换一个项目名称试试。", "", true)
        }
    }

    // 将模板文件拷贝到目标路径
    fs.copySync(answer.template, targetDir)

    // 修改package.json文件中的name和version字段
    modifyPkgJSON({ name: answer.projectName, version: answer.version }, path.join(targetDir, "package.json"))

    info("成功初始化项目！")

    start(targetDir, answer)
}

module.exports = {
    execDefaultInit
}