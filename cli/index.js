#!/usr/bin/env node
import { importJson } from "@miffa/utils"
import { Command } from "commander"
import path from "node:path"
import process from "node:process"
import banner from "@miffa/banner"
import loginAction from "./loginAction"
import { initAction } from "./initAction"

const pkg = importJson(path.join(__dirname, "../package.json"))

const miffa = new Command("miffa")

console.log(`\n${banner}\n`)

miffa
    .usage("<command> [options]")
    .version(`当前脚手架版本 v${pkg.version}`, "-v, --version", "查看脚手架当前版本")
    .helpOption("-h, --help", "查看完整脚手架用法")
    .addHelpCommand("help [command]", "查看指定命令的用法")

miffa
    .command("init")
    .argument("[projectName]", "项目名称（项目根目录文件夹名、package.json 文件name字段）")
    .description("初始化项目，安装依赖、git初始化、创建并关联远程仓库")
    .option("-f, --force", "如果目标文件夹有文件，将强制删除再初始化项目")
    .action(initAction)

miffa
    .command("login")
    .description("登记各个平台的OPEN API访问凭证（例如：Github私人访问令牌）")
    .argument("[platform]", "平台名称（目前支持：github、gitee）", "github")
    .action(loginAction)


miffa.parse(process.argv)