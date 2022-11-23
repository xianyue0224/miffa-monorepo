function registerCommand({ name, commandOptions = {}, description = "", options = [], actionFn, cmdArguments = [] }, program) {
    if (!program) {
        program = this
    }

    let cmdObj = program.command(name, commandOptions).description(description)

    if (cmdArguments.length !== 0) {
        cmdArguments.forEach(({ name, description, defaultValue }) => {
            cmdObj = cmdObj.argument(name, description, defaultValue)
        })
    }

    if (options.length !== 0) {
        options.forEach(({ flags, description, defaultValue }) => {
            cmdObj = cmdObj.option(flags, description, defaultValue)
        })
    }

    cmdObj.action(actionFn)

}

module.exports = { registerCommand }