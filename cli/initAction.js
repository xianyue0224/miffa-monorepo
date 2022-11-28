import prompts from "prompts"
import { execa } from "execa"
import fs from "fs-extra"
import path from "node:path"
import process from "node:process"
import { catchAsync, writeJson } from "@miffa/utils"
import ora from "ora"
import { successExit } from "@miffa/log"

export const initAction = catchAsync(async (projectName, { force }) => {
    const project = {
        cwd: process.cwd(),
        targetDir: projectName,
        get root() {
            return path.resolve(this.cwd, this.targetDir || ".")
        }
    }

    const { shouldOverWrite, template, packageName } = await prompts([
        {
            type: () => project.targetDir ? null : "text",
            name: "projectName",
            message: "请输入项目名称：",
            initial: "miffa-project",
            onState: state => {
                project.targetDir = String(state.value).trim()
            }
        },
        {
            type: () => (canSkipEmptying(project.root) || force) ? null : "confirm",
            name: "shouldOverWrite",
            message: `目标目录 ${project.root} 不是一个空目录。请确认是否清空该目录继续初始化新项目？`
        },
        {
            name: "overwriteChecker",
            type: (prev, values) => {
                if (values.shouldOverWrite === false) {
                    throw new Error(`无法在 ${project.root} 目录下创建新项目！`)
                }
                return null
            }
        },
        {
            name: 'packageName',
            type: () => isValidPackageName(project.targetDir) ? null : 'text',
            message: "请输入 package.json 文件中 name 字段的值：",
            initial: () => toValidPackageName(project.targetDir),
            validate: packageName => isValidPackageName(packageName) || '请输入合法的包名！'
        },
        {
            type: "select",
            name: "template",
            message: "选择一个项目模板：",
            choices: () => {
                const templateDirPath = path.resolve(__dirname, "../template")
                return fs.readdirSync(templateDirPath).map(t => {
                    const templatePath = path.join(templateDirPath, t)
                    const { name: title, description } = JSON.parse(fs.readFileSync(path.join(templatePath, "package.json")))
                    return {
                        title,
                        description,
                        value: templatePath
                    }
                })
            }
        }
    ], {
        onCancel: () => { throw new Error("操作取消！") }
    })

    const copyFile = ora("正在拷贝文件……").start()

    if (!fs.pathExistsSync(project.root)) {
        fs.mkdirSync(project.root)
    } else if (shouldOverWrite) {
        emptyDir(project.root)
    }

    fs.copySync(template, project.root)

    const pkg = { name: packageName ? packageName : project.targetDir }

    writeJson(pkg, path.join(project.root, "package.json"))

    copyFile.succeed("文件拷贝完成！")

    const initGit = ora("初始化 git").start()

    await execa("git init", { cwd: project.root })

    initGit.succeed("Git 初始化完成！")

    const installDependencies = ora("正在安装项目依赖……\n").start()

    await execa("npm install", { cwd: project.root })

    installDependencies.succeed("项目依赖安装完成！")

    await execa("code .", { cwd: project.root })

    successExit("新项目创建完毕！")


})

function emptyDir(dir) {
    if (!fs.pathExistsSync(dir)) {
        return
    }

    postOrderDirectoryTraverse(
        dir,
        dir => fs.rmdirSync(dir),
        file => fs.unlinkSync(file)
    )
}

function canSkipEmptying(dir) {
    if (!fs.pathExistsSync(dir)) {
        return true
    }

    const list = fs.readdirSync(dir)
    const l = list.length

    if (l === 0 || (l === 1 && list[0] === ".git")) {
        return true
    }

    return false
}

function postOrderDirectoryTraverse(dir, dirCallback, fileCallback) {
    for (const filename of fs.readdirSync(dir)) {
        if (filename === '.git') {
            continue
        }
        const fullpath = path.resolve(dir, filename)
        if (fs.lstatSync(fullpath).isDirectory()) {
            postOrderDirectoryTraverse(fullpath, dirCallback, fileCallback)
            dirCallback(fullpath)
            continue
        }
        fileCallback(fullpath)
    }
}

function isValidPackageName(projectName) {
    return /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(projectName)
}

function toValidPackageName(projectName) {
    return projectName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/^[._]/, '')
        .replace(/[^a-z0-9-~]+/g, '-')
}