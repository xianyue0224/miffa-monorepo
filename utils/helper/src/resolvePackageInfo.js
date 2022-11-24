function resolvePackageInfo(str) {
    const arr = str.split("@")

    const info = {
        name: "",
        version: ""
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
            throw new Error("-nm 选项内容格式错误！")
    }

    return info
}

module.exports = { resolvePackageInfo }