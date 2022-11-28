import { importJson } from "./importJson"
import { isAbsolute } from "node:path"
import _ from "lodash"
import fs from "fs-extra"

export function writeJson(obj, file) {
    if (!file || !_.isString(file) || !isAbsolute(file) || !_.isPlainObject(obj)) {
        return
    }
    const pkg = importJson(file)

    fs.outputJSONSync(file, Object.assign({}, pkg, obj))
}