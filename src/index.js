import ValidatorObject from './types/Object.js'
import ValidatorString from './types/String.js'

export default class Validator {
    constructor(value, rules) {
        this.value = value
        this.rules = rules
        this.errors = []
    }

    static object(fields) {
        return new ValidatorObject(fields)
    }

    static string() {
        return new ValidatorString()
    }

    static number() {
        return new ValidatorNumber()
    }
}
