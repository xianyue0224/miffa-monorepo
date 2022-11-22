const ni = require('npminstall')

// 把npm包下载到path/node_modules目录下
function npmInstall({ path, name, version, registry = "https://registry.npmmirror.com/" }) {
    return ni({
        root: path,
        pkgs: [{ name, version }],
        registry
    })
}


module.exports = npmInstall