const chalk = require("chalk")
const process = require("node:process")

const prefix = "Miffa🚀"
const log = console.log

// 错误
const error = (errorMessage, tipMessage, exit = false) => {
    // 打印错误信息
    log(prefix, chalk.red.bold("Error🚨 "), chalk.red(errorMessage))
    // 如果有提示信息，打印
    if (tipMessage) {
        tip(tipMessage)
    }
    // 如果exit为true则结束node进程
    if (exit) {
        failExit(`脚手架将退出执行，你可以修正错误重新输入命令运行脚手架。`)
    }
}

const failExit = failMessage => {
    log(prefix, chalk.redBright.bold.italic("Fail! "), chalk.redBright.bold("💔"), chalk.whiteBright(failMessage))
    process.exit(1)
}

const successExit = successMessage => {
}

// 注意
const notice = (str, noLog = false) => {
    if (noLog) {
        return chalk.blueBright(str)
    }
    log(prefix, chalk.cyan.bold("Notice🎈 "), chalk.blueBright(str))
}

// 信息
const info = (str, noLog = false) => {
    if (noLog) {
        return chalk.whiteBright(str)
    }
    log(prefix, chalk.green.bold("Info🧩 "), chalk.whiteBright(str))
}

// 提示
const tip = str => {
    log(prefix, chalk.greenBright.bold("Tip📌 "), chalk.whiteBright(str))
}

// 警告
const warn = str => {
    log(prefix, chalk.keyword('orange').bold("Warn⚠️ "), chalk.whiteBright(str))
}

// 调试
const debug = str => {
    if (process.env.MIFFA_DEBUG === "y") {
        log(prefix, chalk.magentaBright.bold("Debug🛠️ "), chalk.whiteBright(str))
    }
}

module.exports = {
    chalk,
    error,
    notice,
    info,
    warn,
    debug,
    tip,
    successExit,
    failExit
}