const { info, error, notice } = require("@miffa/log")
const process = require("node:process")
const fs = require("fs-extra")

function re() {
    notice("正在删除脚手架配置文件和缓存目录……")
    try {
        fs.removeSync(process.miffa.config_file_path)
        fs.removeSync(process.miffa.cache_path)
    } catch (err) {
        error("删除脚手架配置文件和缓存目录失败！", "", true)
    }
    info("删除成功！")
}

module.exports = {
    reCmd: {
        name: "re",
        commandOptions: { hidden: true },
        actionFn: re
    }
}