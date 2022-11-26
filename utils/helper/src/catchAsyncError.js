const { error } = require("@miffa/log")

function catchAsyncError(fn) {

    function exitError(err) {
        error(err.message, "", true)
    }

    return function () {
        fn.apply(this, arguments).catch(exitError)
    }
}

module.exports = {
    catchAsyncError
}