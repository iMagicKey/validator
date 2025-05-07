import ValidatorObject from './types/Object.js'
import ValidatorString from './types/String.js'
import ValidatorNumber from './types/Number.js'
import ValidatorArray from './types/Array.js'
import ValidatorBoolean from './types/Boolean.js'
import ValidatorDate from './types/Date.js'

export default class Validator {
    constructor(value, rules) {
        this.value = value
        this.rules = rules
        this.errors = []
    }

    static object(fields) {
        return new ValidatorObject(fields)
    }

    static string(options) {
        return new ValidatorString(options)
    }

    static number(options) {
        return new ValidatorNumber(options)
    }

    static array(options) {
        return new ValidatorArray(options)
    }

    static boolean(options) {
        return new ValidatorBoolean(options)
    }

    static date(options) {
        return new ValidatorDate(options)
    }
}
