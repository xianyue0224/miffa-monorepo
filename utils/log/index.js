const chalk = require("chalk")
const process = require("node:process")

const prefix = "Miffa🚀"
const log = console.log

const error = (str, exit = false) => {
    log(prefix, chalk.red.bold("Error🚨"), chalk.red(str))
    if (exit) {
        process.exit(1)
    }
}
const notice = str => {
    log(prefix, chalk.cyan.bold("Notice🎈"), chalk.blueBright(str))
}
const info = str => {
    log(prefix, chalk.green.bold("Info🧩"), chalk.whiteBright(str))
}

const warn = str => {
    log(prefix, chalk.keyword('orange').bold("Warn⚠️"), chalk.whiteBright(str))
}

const debug = str => {
    if (process.env.MIFFA_DEBUG === "true") {
        log(prefix, chalk.magentaBright.bold("Debug🛠️"), chalk.whiteBright(str))
    }
}

module.exports = {
    chalk,
    error,
    notice,
    info,
    warn,
    debug
}