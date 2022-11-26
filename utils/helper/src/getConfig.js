const { getUserHomePath } = require("./getUserHomePath")
const path = require("node:path")
const fs = require("fs-extra")

const default_config = {
    lowest_node_version: "12.0.0",
    get user_home_path() { return getUserHomePath() },
    get config_file_path() { return path.join(this.user_home_path, "miffa.config.json") },
    get cache_path() { return path.join(this.user_home_path, ".miffa_cache") },
    init_node_modules: [{ name: "占位用", path: "占位用" }]
}

function getConfig() {
    if (!fs.pathExistsSync(default_config.config_file_path)) {
        fs.outputJSONSync(default_config.config_file_path, default_config)
    }

    const config = require(default_config.config_file_path)

    const proxy = new Proxy(config, {
        set(target, key, newVal) {
            const temp = require(default_config.config_file_path)
            temp[key] = newVal
            fs.outputJSONSync(default_config.config_file_path, temp)
            target[key] = newVal
        }
    })

    return proxy
}

module.exports = {
    getConfig
}