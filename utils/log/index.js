const chalk = require("chalk")

const prefix = "Miffa✨"
const log = console.log

const error = str => {
    log(prefix, chalk.red.bold("Error📢"), chalk.red(str))
}
const notice = str => {
    log(prefix, chalk.cyan.bold("Notice🎈"), chalk.blueBright(str))
}
const info = str => {
    log(prefix, chalk.green.bold("Info📌"), chalk.whiteBright(str))
}

const warn = str => {
    log(prefix, chalk.keyword('orange').bold("Warn⚠️"), chalk.whiteBright(str))
}

module.exports = {
    error,
    notice,
    info,
    warn
}