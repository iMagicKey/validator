export default class ValidatorString {
    constructor() {
        this.rules = []
        this.errors = []
        this.isRequired = false
    }

    required() {
        this.isRequired = true
        return this
    }

    fn(rule) {
        this.rules.push((value, errors) => {
            try {
                rule(value, errors)
            } catch (error) {
                errors.push({ field: null, code: 'STRING_CUSTOM_VALIDATION', message: `Custom validation error: ${error.message}` })
            }
        })
        return this
    }

    length(limit) {
        this.rules.push((value, errors) => {
            if (value.length !== limit) {
                errors.push({ field: null, code: 'STRING_LENGTH', message: `Value must have a length of ${limit} characters, ${value.length} given.` })
            }
        })
        return this
    }

    max(limit) {
        this.rules.push((value, errors) => {
            if (value.length > limit) {
                errors.push({ field: null, code: 'STRING_MAX_LENGTH', message: `Value must have at most ${limit} characters, ${value.length} given.` })
            }
        })
        return this
    }

    min(limit) {
        this.rules.push((value, errors) => {
            if (value.length < limit) {
                errors.push({ field: null, code: 'STRING_MIN_LENGTH', message: `Value must have at least ${limit} characters, ${value.length} given.` })
            }
        })
        return this
    }

    pattern(pattern, options) {
        this.rules.push((value, errors) => {
            const { invert } = options || {}
            const patternRegex = pattern instanceof RegExp ? pattern : new RegExp(pattern)

            const isMatching = patternRegex.test(value)
            if ((invert && isMatching) || (!invert && !isMatching)) {
                errors.push({ field: null, code: 'STRING_PATTERN_MISMATCH', message: `Value fails to match the specified pattern "${patternRegex}".` })
            }
        })
        return this
    }

    validate(value) {
        this.errors = []

        const valueType = Object.prototype.toString.call(value)

        if (valueType === '[object String]') {
            for (const rule of this.rules) {
                rule(value, this.errors)
            }
        } else {
            if ((valueType === '[object Undefined]' && this.isRequired) || valueType !== '[object Undefined]') {
                this.errors.push({ field: null, code: 'STRING_TYPE_ERROR', message: `Value must be type of [object String]. ${valueType} given.` })
            }
        }

        return this.errors.length === 0
    }
}
