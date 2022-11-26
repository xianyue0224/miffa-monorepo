const { homedir } = require("node:os")
const pathExists = require("fs-extra").pathExistsSync
const { error, failExit } = require("@miffa/log")


function getUserHomePath() {
    let path = ""
    return () => {
        if (!path) {
            path = homedir()
            if (!path || !pathExists(path)) {
                error("无法获取到用户的主目录。", "", true)
            }
        }
        return path
    }
}

module.exports = {
    getUserHomePath: getUserHomePath()
}
