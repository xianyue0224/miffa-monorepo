const path = require("node:path")
const fs = require("node:fs")
const execa = require("execa")
const ora = require("ora")

let workspaces = require("../package.json").workspaces

let packages = []

const root = path.join(__dirname, "../")

workspaces.forEach(w => {
    if (!w.endsWith("/*")) {
        packages.push(path.join(root, w))
    } else {
        fs.readdirSync(path.join(root, w.replace("/*", "")))
            .map(i => path.join(root, w.replace("/*", ""), i))
            .forEach(i => packages.push(i))
    }
})

// ["miffa","@miffa/log","@miffa/utils","@miffa/banner"]
workspaces = packages.map(root => {
    const pkg = require(path.join(root, "package.json"))
    return pkg.name
})

/** 
 * 这一步过后的packages
 * [
 *  {
 *      name:"miffa",
 *      root:"F:\\Desktop\\projects\\miffa-monorepo\\cli",
 *      dependsOn:[
 *          "@miffa/utils",
 *          "@miffa/log",
 *          "@miffa/ banner"],
 *      build:false
 * },
 * {
 *      name:"@miffa/log",
 *      root:"F:\\Desktop\\projects\\miffa-monorepo\\packages\\log",
 *      dependsOn:[],
 *      build:false
 * },
 * {
 *      name:"@miffa/utils",
 *      root:"F:\\Desktop\\projects\\miffa-monorepo\\packages\\utils",
 *      dependsOn:["@miffa/log"],
 *      build:false
 * },
 * {
 *      name:"@miffa/banner",
 *      root:"F:\\Desktop\\projects\\miffa-monorepo\\packages\\banner,
 *      dependsOn:[],
 *      build:false
 * }
 * ]
 */
packages = packages.map(root => {
    const pkg = require(path.join(root, "package.json"))
    const dependencies = Object.keys(pkg.dependencies ? pkg.dependencies : {})
    const devDependencies = Object.keys(pkg.devDependencies ? pkg.devDependencies : {})

    return {
        name: pkg.name,
        root,
        get dependsOn() {
            const dependenciesFromWorkspaces = jiaoji(workspaces, dependencies)
            const devDependenciesFromWorkspaces = jiaoji(workspaces, devDependencies)

            return dependenciesFromWorkspaces.concat(devDependenciesFromWorkspaces)
        }
    }
})

// 找出两个数组的交叉元素
function jiaoji(arr1, arr2) {
    const res = []
    arr1.forEach(i => {
        if (arr2.includes(i)) {
            res.push(i)
        }
    })
    return res
}

const buildQueue = []

function appendToBuilding(package) {

    const dependsOn = package.dependsOn
    if (dependsOn.length !== 0) {
        for (let i = 0; i < dependsOn.length; i++) {
            const name = dependsOn[i];
            const target = packages.find(i => i.name === name)
            appendToBuilding(target)
        }
    }

    if (buildQueue.includes(package.name)) return
    buildQueue.push(package.name)
    // console.log(`${package.name} 开始构建……`)
    // await execa("npm run build", { cwd: package.root })
    // console.log(`${package.name} 构建完成！`)
    // package.built = true
}

async function build(buildQueue, packages) {
    for (let i = 0; i < buildQueue.length; i++) {
        const name = buildQueue[i];
        const target = packages.find(i => i.name === name)
        const spinner = ora(`开始构建 ${name}……`).start()
        await execa("npm run build", { cwd: target.root })
        spinner.succeed(`${name} 构建完成！`)
    }
}

try {
    packages.forEach(package => {
        appendToBuilding(package)
    })

    build(buildQueue, packages)
} catch (error) {
    console.log(error.message)
}