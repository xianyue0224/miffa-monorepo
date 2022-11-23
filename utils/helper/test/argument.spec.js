const { assert } = require("chai")
const { argument } = require("../src/index")

describe("#argument()", () => {
    it("返回值是一个对象", () => {
        assert.isObject(argument("abc", "abc", "abc"))
    })
    it("返回值格式校验", () => {
        const res1 = argument("a", "b", "c")
        assert.propertyVal(res1, "name", "a")
        assert.propertyVal(res1, "description", "b")
        assert.propertyVal(res1, "defaultValue", "c")

        const res2 = argument("a", "b")
        assert.propertyVal(res2, "name", "a")
        assert.propertyVal(res2, "description", "b")
        assert.propertyVal(res2, "defaultValue", undefined)
    })
})