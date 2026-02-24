export default class ValidatorBoolean {
    constructor(options) {
        this.rules = []
        this.errors = []
        this.isRequired = false
        this.isStrict = options?.strict ?? true
    }

    required() {
        this.isRequired = true
        return this
    }

    resolveBoolean(value) {
        const valueType = Object.prototype.toString.call(value)

        if (valueType === '[object Boolean]') {
            return value
        }

        if (this.isStrict) {
            return null
        }

        if (valueType === '[object Number]') {
            if (value === 1) {
                return true
            }

            if (value === 0) {
                return false
            }

            return null
        }

        if (valueType === '[object String]') {
            const lowerValue = value.toLowerCase()

            if (lowerValue === 'true') {
                return true
            }

            if (lowerValue === 'false') {
                return false
            }
        }

        return null
    }

    isTrue() {
        this.rules.push((value, errors) => {
            const isTrueValue = this.resolveBoolean(value) === true

            if (!isTrueValue) {
                errors.push({ field: null, code: 'BOOLEAN_NOT_TRUE', message: 'Value must be true.' })
            }
        })
        return this
    }

    isFalse() {
        this.rules.push((value, errors) => {
            const isFalseValue = this.resolveBoolean(value) === false

            if (!isFalseValue) {
                errors.push({ field: null, code: 'BOOLEAN_NOT_FALSE', message: 'Value must be false.' })
            }
        })
        return this
    }

    fn(customValidator) {
        this.rules.push((value, errors) => {
            try {
                customValidator(value, errors)
            } catch (error) {
                errors.push({ field: null, code: 'BOOLEAN_CUSTOM_VALIDATION', message: `Custom validation error: ${error.message}` })
            }
        })
        return this
    }

    validate(value) {
        this.errors = []
        const valueType = Object.prototype.toString.call(value)
        const isValid = this.resolveBoolean(value) !== null

        if (isValid) {
            for (const rule of this.rules) {
                rule(value, this.errors)
            }
        } else {
            if ((valueType === '[object Undefined]' && this.isRequired) || valueType !== '[object Undefined]') {
                this.errors.push({
                    field: null,
                    code: 'BOOLEAN_TYPE_ERROR',
                    message: `Value must be type of [object Boolean]${
                        this.isStrict ? '' : ', [object Number] (0 or 1), or [object String] ("true" or "false")'
                    }. ${valueType} given.`,
                })
            }
        }

        return this.errors.length === 0
    }
}
