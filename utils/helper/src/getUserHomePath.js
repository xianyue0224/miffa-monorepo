const { homedir } = require("node:os")
const pathExists = require("fs-extra").pathExistsSync
const { error, debug } = require("@miffa/log")
const { exit } = require("node:process")
const { setEnv } = require("./setEnv")


function getUserHomePath() {
    let path = ""
    return () => {
        if (!path) {
            path = homedir()
            if (!path || !pathExists(path)) {
                error("无法获取到用户的主目录。")
                exit(1)
            }
            // MIFFA_USER_HOME_PATH
            setEnv("user_home_path", path)
            debug(`用户主目录：${path}`)
        }
        return path
    }
}

module.exports = {
    getUserHomePath: getUserHomePath()
}
