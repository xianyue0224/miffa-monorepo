import chalk from "chalk"
import process from "node:process"

const prefix = "Miffa 👻 ~ "

export const errorExit = message => {
    console.log(chalk.bold(prefix), chalk.redBright.bold.italic("Error "), "🚨 ", chalk.whiteBright(message))
    process.exit(1)
}

export const successExit = message => {
    console.log(chalk.bold(prefix), chalk.greenBright.bold.italic("Success "), "✨ ", chalk.whiteBright(message))
    process.exit(1)
}
