import prompts from "prompts"
import ora from "ora"
import { catchAsync, writeConfig } from "@miffa/utils"
import { errorExit, successExit } from "@miffa/log"
import { Octokit } from "octokit"
import axios from "axios"

const handleGithub = catchAsync(async () => {
    const { token } = await prompts({
        type: "password",
        name: "token",
        "message": "请输入具有 public_repo & user 权限的 Github 私人访问令牌（如果你不知道如何获取，可以访问这个链接https://jashd.sdsd.sdd）："
    })

    const spinner = ora("正在校验令牌……\n").start()

    const octokit = new Octokit({
        auth: token
    })

    const { status, data } = await octokit.request('GET /user', {})

    if (status !== 200) {
        spinner.fail("验证失败！")
        errorExit("")
    }

    spinner.succeed("验证成功！")

    writeConfig({
        github: {
            name: data.login,
            token,
            detail: data
        }
    })

    successExit("")
})

const handleGitee = catchAsync(async () => {
    const { token } = await prompts({
        type: "password",
        name: "token",
        "message": "请输入具有 projects & user_info 权限的 Gitee 私人访问令牌（如果你不知道如何获取，可以访问这个链接https://jashd.sdsd.sdd）："
    })

    const spinner = ora("正在校验令牌……\n").start()

    const request = new XMLHttpRequest()

    request.onreadystatechange = () => {
        console.log("🚀 ~ handleGitee ~ request.readyState", request.readyState)
        if (request.readyState === XMLHttpRequest.DONE) {
            if (request.status === 200) {
                console.log(request.body)
            } else {
                console.log("error")
            }
        }
    }

    request.open("get", `https://gitee.com/api/v5/user?access_token=${token}`)

    // const res = await axios.get(`https://gitee.com/api/v5/user?access_token=${token}`)

    // console.log(res)

    // if (status !== 200) {
    //     spinner.fail("验证失败！")
    //     errorExit("")
    // }

    // spinner.succeed("验证成功！")

    // writeConfig({
    //     github: {
    //         name: data.login,
    //         token,
    //         detail: data
    //     }
    // })

    // successExit("")
})

const handlers = {
    github: handleGithub
}

export default function loginAction(platform) {
    if (!Object.keys(handlers).includes(platform)) {
        errorExit(`暂不支持 ${platform} 平台。已支持的平台有 ${Object.keys(handlers).join("、")} 。`)
    }

    handlers[platform]()
}