const { assert } = require("chai")
const { resolvePackageInfo } = require("../src/index")

describe("#resolvePackageInfo()", () => {
    it("返回值是一个普通对象", async () => {
        const res = await resolvePackageInfo("vue")
        assert.isObject(res)
    })
    it("返回值对象属性校验1", async () => {
        const res = await resolvePackageInfo("vue@3.2.0")
        assert.propertyVal(res, "name", "vue")
        assert.propertyVal(res, "version", "3.2.0")
        assert.propertyVal(res, "cacheName", "vue@3.2.0")
    })
    it("返回值对象属性校验2", async () => {
        const res = await resolvePackageInfo("@miffa/log@3.2.0")
        assert.propertyVal(res, "name", "@miffa/log")
        assert.propertyVal(res, "version", "3.2.0")
        assert.propertyVal(res, "cacheName", "@miffa/log@3.2.0")
    })
    it("返回值对象属性校验3", async () => {
        const res = await resolvePackageInfo("@miffa/log@sads")
        assert.propertyVal(res, "name", "@miffa/log")
        assert.propertyVal(res, "version", "sads")
        assert.propertyVal(res, "cacheName", "@miffa/log@sads")
    })
})