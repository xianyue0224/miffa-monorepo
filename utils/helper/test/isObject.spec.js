const { assert } = require("chai")
const { isObject } = require("../src/index")

describe("#isObject()", () => {
    it("当参数是一个普通对象时，应该返回true", () => {
        assert.isTrue(isObject({ id: 1 }))
    })
    it("当参数是一个特殊对象时，应该返回false", () => {
        assert.isFalse(isObject([]))
    })
    it("当参数为一个基本数据类型时，应该返回false", () => {
        assert.isFalse(isObject(1))
        assert.isFalse(isObject("str"))
        assert.isFalse(isObject(undefined))
        assert.isFalse(isObject(true))
    })
    it("当参数为undefined时，应该返回false", () => {
        assert.isFalse(isObject(undefined))
    })
    it("当参数为null时，应该返回false", () => {
        assert.isFalse(isObject(null))
    })
})