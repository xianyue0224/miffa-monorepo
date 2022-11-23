const latestVersion = require('latest-version')
const { debug } = require("@miffa/log")

async function resolvePackageInfo(str) {
    const arr = str.split("@")
    // @miffa/log => ["","miffa/log"]
    // @miffa/log@1.0.0 => ["","miffa/log","1.0.0"]
    // vue@1.0.0 => ["vue","1.0.0"]
    // vue => ["vue"]

    const info = {
        name: "",
        version: "",
        get cacheName() { return `${this.name}@${this.version}` }
    }

    switch (arr.length) {
        case 1: {
            info.name = arr[0]
            info.version = "latest"
            break
        }
        case 3: {
            info.name = `@${arr[1]}`
            info.version = arr[2]
            break
        }
        case 2: {
            if (arr[0] === "") {
                info.name = `@${arr[1]}`
                info.version = "latest"
                break
            } else {
                info.name = arr[0]
                info.version = arr[1]
                break
            }
        }
        default:
            throw new Error("-np 选项内容格式错误！")
    }

    if (info.version === "latest") {
        info.version = await latestVersion(info.name)
    }

    debug(`npm包： ${info.cacheName}`)

    return info
}

module.exports = { resolvePackageInfo }