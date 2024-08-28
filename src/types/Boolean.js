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

    isTrue() {
        this.rules.push((value, errors) => {
            const isTrueValue = this.isStrict ? value === true : value === true || value === 1 || value === '1' || value.toLowerCase() === 'true'

            if (!isTrueValue) {
                errors.push({ field: null, code: 'BOOLEAN_NOT_TRUE', message: 'Value must be true.' })
            }
        })
        return this
    }

    isFalse() {
        this.rules.push((value, errors) => {
            const isFalseValue = this.isStrict ? value === false : value === false || value === 0 || value === '0' || value.toLowerCase() === 'false'

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

        let isValid = false

        if (this.isStrict) {
            isValid = valueType === '[object Boolean]'
        } else {
            if (valueType === '[object Boolean]') {
                isValid = true
            } else if (valueType === '[object Number]') {
                isValid = value === 0 || value === 1
            } else if (valueType === '[object String]') {
                const lowerValue = value.toLowerCase()
                isValid = lowerValue === 'true' || lowerValue === 'false'
            }
        }

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
