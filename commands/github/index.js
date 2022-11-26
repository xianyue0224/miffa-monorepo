const { debug, error, successExit } = require("@miffa/log")
const prompts = require("prompts")
const process = require("node:process")
const ora = require("ora")
const axios = require("axios")

function catchAsyncError(fn) {

    function exitError(err) {
        error(err.message, "", true)
    }

    return function () {
        fn.apply(this, arguments).catch(exitError)
    }
}

const github = catchAsyncError(async function () {
    debug("执行 github 命令逻辑")
    const config = process.miffa
    if (config.github) {
        const { isLogout } = await prompts({
            type: "toggle",
            name: "isLogout",
            message: "你之前已经为脚手架登记过 github 的 API 凭证了，选择 yes 会清空之前的凭证重新登记，选择 no 退出脚手架。",
            initial: false,
            active: "yes",
            inactive: "no"
        })

        debug(`isLogout:${isLogout}`)

        if (isLogout) {
            config.github = {}
        } else {
            process.exit(1)
        }
    }

    const { userName, email, token } = await prompts([
        {
            type: "text",
            name: "userName",
            message: "github用户名：",
        },
        {
            type: "text",
            name: "email",
            message: "github 账户邮箱："
        },
        {
            type: "password",
            name: "token",
            message: "用有 repo 范围或者 public_repo 范围的个人访问令牌"
        }
    ])

    debug(`userName:${userName}`)
    debug(`email:${email}`)
    debug(`token:${token}`)

    const spinner = ora({
        text: "正在验证……\n",
        prefixText: "Miffa🚀 "
    }).start()

    const res = await axios.get("https://api.github.com/user", {
        headers: {
            Accept: "application / vnd.github + json",
            Authorization: `Bearer ${token}`
        }
    })

    if (res.status === 200) {
        config.github = {
            userName,
            email,
            token
        }
        spinner.stop("验证成功！")
        successExit("")
    }

    spinner.fail("验证失败！")
})


module.exports = {
    githubCmd: {
        name: "github",
        description: "为脚手架创建github仓库提供必要的github API凭证",
        actionFn: github
    }
}

