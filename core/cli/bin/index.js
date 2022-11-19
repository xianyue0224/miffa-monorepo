#!/usr/bin/env node

const importLocal = require("import-local")
const process = require("process")

if (importLocal(__filename)) {
    console.log("正在使用本地版本的 miffa")
} else {
    require("../lib")(process.argv.slice(2))
}