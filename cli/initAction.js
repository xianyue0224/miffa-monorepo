import { catchAsync, writeJson, readConfig } from "@miffa/utils"
import { execa, execaCommand } from "execa"
import { successExit, warn } from "@miffa/log"
import process from "node:process"
import { Octokit } from "octokit"
import prompts from "prompts"
import path from "node:path"
import fs from "fs-extra"
import ora from "ora"

let myExeca

export const initAction = catchAsync(async (projectName, { force }) => {
    const cwd = process.cwd()
    const project = {
        targetDir: projectName,
        get root() {
            return path.resolve(cwd, this.targetDir || ".")
        }
    }

    // result -> {shouldEmpty,packageName,template}
    const result = await prompts([
        // 如果输入命令时不提供projectName，这个提问会让用户输入一个名称，用来当作新项目的根目录文件夹名
        {
            type: () => project.targetDir ? null : "text",
            name: "projectName",
            message: "请输入项目名称：",
            initial: "miffa-project",
            onState: state => {
                project.targetDir = String(state.value).trim()
            }
        },
        // 根据上一步输入的名称确定最终的项目根目录绝对路径，检查是否需要清空该目录，如果需要清空并且在最开始不输入-f选项就会让用户确认是否清空
        {
            type: () => (canSkipEmptying(project.root) || force) ? null : "confirm",
            name: "shouldEmpty",
            message: `目标目录 ${project.root} 不是一个空目录。请确认是否清空该目录继续初始化新项目？`
        },
        // 检查上一步的结果，如果上一步的结果是false，将会抛出错误终止脚手架
        {
            name: "emptyChecker",
            type: (prev, values) => {
                if (values.shouldEmpty === false) {
                    throw new Error(`无法在 ${project.root} 目录下创建新项目！`)
                }
                return null
            }
        },
        // 如果前面输入的项目根目录文件夹名projectName符合npm包名规范，则不会有此题，默认packageName等于projectName
        {
            name: 'packageName',
            type: () => isValidPackageName(project.targetDir) ? null : 'text',
            message: "请输入 package.json 文件中 name 字段的值：",
            initial: () => toValidPackageName(project.targetDir),
            validate: packageName => isValidPackageName(packageName) || '请输入合法的包名！'
        },
        // 选择一个项目模板，最后拿到的是模板根目录的绝对路径
        {
            type: "select",
            name: "template",
            message: "选择一个项目模板：",
            choices: () => {
                const templateDirPath = path.resolve(__dirname, "../miffa-templates")
                return fs.readdirSync(templateDirPath).filter(i => !["README.md", ".git"].includes(i)).map(t => {
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

    // 拷贝模板文件到项目根目录
    // project -> {root,targetDir}
    // result -> {template,shouldEmpty,packageName}
    copyTemplate({ ...project, ...result })

    myExeca = command => execa(command, { cwd: project.root })

    // 初始化 Git -----------------------------------------------------
    const initGitSpinner = ora("初始化 git").start()
    await myExeca("git init")
    initGitSpinner.succeed("Git 初始化完成！")
    // 安装依赖 -------------------------------------------------------
    const installSpinner = ora("正在安装项目依赖……\n").start()
    await myExeca("npm i")
    installSpinner.succeed("项目依赖安装完成！")
    // 创建并关联远程仓库 ----------------------------------------------------
    const clone_url = await creatGithubRepo(toValidPackageName(project.targetDir))
    if (clone_url) {
        const addOriginSpinner = ora("关联远程仓库……").start()
        await execaCommand(`git remote add origin ${clone_url}`, { cwd: project.root })
        addOriginSpinner.succeed("成功关联远程仓库！")
        // 首次推送 -----------------------------------------------------------
        const firstPushSpinner = ora("第一次推送……\n").start()
        await myExeca(`git add .`)
        await myExeca(`git commit -m "init"`)
        console.log("推送代码可能会因为网络原因卡着一直无法完成，可以直接退出脚手架，此时，已经创建好远程仓库并关联了，可以手动推送代码。")
        await myExeca(`git push -u origin master`)
        firstPushSpinner.succeed("推送成功！")
    }
    // 打开编辑器 ----------------------------------------------------------
    await myExeca("code .")
    // 结束 ---------------------------------------------------------------
    successExit("新项目创建完毕！")
})

/** 拷贝模板文件到项目根目录中，并修改package.json文件
 * @param {*} root 项目根目录绝对路径
 * @param {*} template 模板文件所在绝对路径
 * @param {*} shouldEmpty 是否应该先将项目根目录清空
 * @param {*} packageName 用来替换模板package.json文件中的name字段
 * @param {*} targetDir 项目根目录文件夹名称
 */
function copyTemplate({ root, template, shouldEmpty, packageName, targetDir }) {
    const copyFileSpinner = ora("正在拷贝文件……").start()

    if (!fs.pathExistsSync(root)) {
        fs.mkdirSync(root)
    } else if (shouldEmpty) {
        emptyDir(root)
    }

    // 拷贝
    fs.copySync(template, root)

    // 修改package.json
    const pkg = { name: packageName ? packageName : targetDir }
    writeJson(pkg, path.join(root, "package.json"))

    copyFileSpinner.succeed("文件拷贝完成！")
}


// 创建Github仓库
async function creatGithubRepo(repoName) {
    // 读取配置
    const config = readConfig()
    if (!config.github || !config.github.token) {
        warn("请先执行命令 miffa login 登记 Github 的私人访问令牌")
        return null
    }

    // 从配置中提取token和用户名
    const token = config.github.token
    const name = config.github.name

    // 展示loading
    const spinner = ora(`尝试为用户 ${name} 创建名为 ${repoName} 的远程 Github 仓库……\n`).start()

    const octokit = new Octokit({
        auth: token
    })

    const res = await octokit.request('POST /user/repos', {
        name: repoName,
        private: false
    })

    if (res.status === 201) {
        spinner.succeed("仓库创建成功！")
        return res.data.clone_url
    }

    return null
}

// 返回true表示目标路径不需要清空，返回false表示需要清空
function canSkipEmptying(dir) {
    return !fs.pathExistsSync(dir) || fs.readdirSync(dir).length === 0
}

// 清空目录
function emptyDir(dir) {
    if (!fs.pathExistsSync(dir)) {
        return
    }
    postOrderDirectoryTraverse(dir, fs.rmdirSync, fs.unlinkSync)
}

// 迭代一个路径下的目录或者文件，将目录和文件的绝对路径分别交给对应的回调处理
function postOrderDirectoryTraverse(dir, dirCallback, fileCallback) {
    for (const filename of fs.readdirSync(dir)) {
        const fullpath = path.resolve(dir, filename)
        if (fs.lstatSync(fullpath).isDirectory()) {
            postOrderDirectoryTraverse(fullpath, dirCallback, fileCallback)
            dirCallback(fullpath)
            continue
        }
        fileCallback(fullpath)
    }
}

// 校验字符串是否符合npm包名规范
function isValidPackageName(projectName) {
    return /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(projectName)
}

// 将字符串解析为符合npm包名规范，不允许的字符会被删除
function toValidPackageName(projectName) {
    return projectName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/^[._]/, '')
        .replace(/[^a-z0-9-~]+/g, '-')
}