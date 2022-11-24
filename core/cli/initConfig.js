const process = require("node:process")
const { error } = require("@miffa/log")
const { homedir } = require("node:os")
const { join } = require("node:path")
const fs = require("fs-extra")

const user_home_path = homedir()

if (!user_home_path) {
    error("无法获取用户主目录！", "", true)
}

const default_config = {
    lowest_node_version: "12.0.0",
    user_home_path,
    config_file_path: join(user_home_path, "miffa.config.json"),
    cache_path: join(user_home_path, "miffa_cache"),
    init_node_modules: [{ name: "占位用", path: "占位用" }]
}

function initConfig() {
    if (!fs.pathExistsSync(default_config.config_file_path)) {
        fs.outputJSONSync(default_config.config_file_path, default_config)
    }

    const config = require(default_config.config_file_path)

    const proxy = new Proxy(config, {
        set(target, key, newVal) {
            if (target[key] === newVal) return
            const temp = require(default_config.config_file_path)
            temp[key] = newVal
            fs.outputJSONSync(default_config.config_file_path, temp)
            target[key] = newVal
        }
    })

    process.miffa = proxy
}

module.exports = {
    initConfig
}