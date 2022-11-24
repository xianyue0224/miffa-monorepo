const { registerCommand, setEnv } = require("@miffa/helper")
const { error, info, debug, notice, chalk } = require("@miffa/log")
const { initCmd } = require("@miffa/init")
const { reCmd } = require("@miffa/re")
const process = require("node:process")
const { Command } = require("commander")
const pkg = require("./package.json")

// 脚手架初始化
function initCli(program = new Command()) {
    program
        .name(chalk.cyan.bold("Miffa"))
        .usage("<command> [options]")
        .description(notice("欢迎使用 Miffa 🚀🚀~", true))

    program.version(notice(`当前版本 v${pkg.version}`, true), "-v, --version", "查看脚手架当前版本号")

    // 注册全局选项
    program.option("-d, --debug", "是否开启调试模式", false)
    program.option("-lm, --localModule [localModule]", "使用本地模块导出的方法替代当前命令的处理函数")
    program.option("-nm, --npmModule [npmModule]", "使用已发布到npm上的模块导出的方法替代当前命令的处理函数")

    // 注册命令
    registerCommand.call(program, initCmd)

    registerCommand.call(program, reCmd)

    // 控制debug模式
    program.on("option:debug", function () {
        const isDebug = this.opts().debug
        if (isDebug) {
            process.env.MIFFA_DEBUG = "y"
            debug("调试模式已开启！")
        }
    })

    // 当输入未知命令时的处理函数
    program.on("command:*", function (command) {
        const availableCommands = this.commands.map(command => command._name)
        error(`未知命令 ${command}`, `可用命令：${availableCommands.join(" ")} help`, true)
    })

    program.parse(process.argv)
}

module.exports = {
    initCli
}