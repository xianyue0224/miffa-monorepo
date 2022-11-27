import fs from "fs-extra"
import { homedir } from "node:os"
import { errorExit } from "@miffa/log"
import path from "node:path"

const defaultConfig = { cli: "miffa" }

export function readConfig() {
    const userHome = homedir()
    if (!userHome) {
        errorExit("无法获取用户主目录！")
    }

    const configFilePath = path.join(userHome, "miffa.config.json")

    if (!fs.pathExistsSync(configFilePath)) {
        fs.outputJSONSync(configFilePath, defaultConfig)
    }

    return JSON.parse(fs.readFileSync(configFilePath))
}