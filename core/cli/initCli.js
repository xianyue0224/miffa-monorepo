const { registerCommand, setEnv } = require("@miffa/helper")
const { error, info, debug, chalk } = require("@miffa/log")
const { initCmd } = require("@miffa/init")
const { reCmd } = require("@miffa/re")
const { argv } = require("node:process")
const { Command } = require("commander")
const pkg = require("./package.json")

// 脚手架初始化
function initCli(program = new Command()) {
    program
        .name("Miffa")
        .usage("<command> [options]")
        .description("欢迎使用 Miffa 🚀🚀~")
        .version(chalk.cyan.bold(`当前版本为 v${pkg.version}`), "-v, --version", "查看当前版本")
        .option("-d, --debug", "是否开启调试模式", false)

    // 注册命令
    registerCommand.call(program, initCmd)

    registerCommand.call(program, reCmd)

    // 当输入未知命令时的处理函数
    program.on("command:*", function (command) {
        error(`未知命令 ${command}`)
        const availableCommands = this.commands.map(command => command._name)
        info(`可用命令：${availableCommands.join("，")}，help`)
    })

    // 控制debug模式
    program.on("option:debug", function () {
        const isDebug = this.opts().debug
        if (isDebug) {
            setEnv("debug", isDebug)
            debug("调试模式已开启！")
        }
    })

    program.parse(argv)
}

module.exports = {
    initCli
}