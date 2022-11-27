import { errorExit } from "@miffa/log"

export function catchAsync(fn) {
    return function () {
        fn.apply(this, arguments).catch(err => errorExit(err.message))
    }
}