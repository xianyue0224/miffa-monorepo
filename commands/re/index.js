const { info, error, notice } = require("@miffa/log")
const { env, exit } = require("node:process")
const fs = require("fs-extra")

function re() {
    notice("正在删除脚手架配置文件和缓存目录……")
    try {
        fs.removeSync(env.MIFFA_CONFIG_FILE_PATH)
        fs.removeSync(env.MIFFA_CACHE_DIR_PATH)
    } catch (err) {
        error("删除脚手架配置文件和缓存目录失败！")
        exit(1)
    }
    info("删除成功！")
    exit(1)
}

module.exports = {
    reCmd: {
        name: "re",
        commandOptions: { hidden: true },
        actionFn: re
    }
}