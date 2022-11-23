const { assert } = require("chai")
const { option } = require("../src/index")

describe("#option()", () => {
    it("返回值是一个对象", () => {
        assert.isObject(option("abc", "abc", "abc"))
    })
    it("返回值格式校验", () => {
        const res1 = option("a", "b", "c")
        assert.propertyVal(res1, "flags", "a")
        assert.propertyVal(res1, "description", "b")
        assert.propertyVal(res1, "defaultValue", "c")

        const res2 = option("a", "b")
        assert.propertyVal(res2, "flags", "a")
        assert.propertyVal(res2, "description", "b")
        assert.propertyVal(res2, "defaultValue", undefined)
    })
})