const { assert } = require("chai")
const { registerCommand, argument, option } = require("../src/index")
const { Command } = require("commander")

describe("#registerCommand()", () => {
    let name, f, lp, np

    function initCli(program) {
        program
            .name("Miffa")
            .usage("<command> [options]")
            .description("欢迎使用 Miffa 🚀🚀~")
            .version("1.0.0", "-v, --version", "查看当前版本")
            .option("-d, --debug", "是否开启调试模式", false)
        registerCommand.call(program, {
            command: "init",
            description: "初始化项目",
            cmdArguments: [
                argument("[projectName]", "项目名称", "miffa-project")
            ],
            options: [
                option("-f, --force", "是否强制初始化项目", false),
                option("-lp, --localPath <localPath>", "使用本地npm模块导出的方法作为init命令的处理函数"),
                option("-np, --npmPackage <npmPackage>", "使用远程npm模块导出的方法作为init命令的处理函数")
            ],
            actionFn: function (projectName, { force, localPath, npmPackage }) {
                name = projectName
                f = force
                lp = localPath
                np = npmPackage
            }
        })
    }
    it("测试脚手架1", () => {
        const program = new Command()
        initCli(program)
        program.parse(["", "", "init", "-f", "-np", "abc"])
        assert.equal(name, "miffa-project")
        assert.equal(f, true)
        assert.equal(np, "abc")
    })
    it("测试脚手架2", () => {
        const program = new Command()
        initCli(program)
        program.parse(["", "", "init", "abcd", "-lp", "abc"])
        assert.equal(name, "abcd")
        assert.equal(f, false)
        assert.equal(lp, "abc")
    })
})