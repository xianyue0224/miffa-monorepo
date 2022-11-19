'use strict';

const pkg = require("../package.json")
const log = require("@miffa/log")

module.exports = core;

function core() {
    console.log("hello miffa!")
    checkPkgVersion()
    log.success("", "test")
}

function checkPkgVersion() {
    log.notice("", pkg.version)
}