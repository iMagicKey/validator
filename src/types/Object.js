export default class ValidatorObject {
    constructor(fields = {}) {
        this.rules = []
        this.errors = []
        this.isRequired = false
        this.fields = fields
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
                errors.push({ field: null, code: 'OBJECT_CUSTOM_VALIDATION', message: `Custom validation error: ${error.message}` })
            }
        })
        return this
    }

    length(limit) {
        this.rules.push((value, errors) => {
            const keys = Object.keys(value)
            if (keys.length !== limit) {
                errors.push({ field: null, code: 'OBJECT_KEYS_LENGTH', message: `Object must have exactly ${limit} keys, ${keys.length} given.` })
            }
        })
        return this
    }

    max(limit) {
        this.rules.push((value, errors) => {
            const keys = Object.keys(value)
            if (keys.length > limit) {
                errors.push({ field: null, code: 'OBJECT_KEYS_MAX', message: `Object must have at most ${limit} keys, ${keys.length} given.` })
            }
        })
        return this
    }

    min(limit) {
        this.rules.push((value, errors) => {
            const keys = Object.keys(value)
            if (keys.length < limit) {
                errors.push({ field: null, code: 'OBJECT_KEYS_MIN', message: `Object must have at least ${limit} keys, ${keys.length} given.` })
            }
        })
        return this
    }

    validate(value) {
        this.errors = []

        const valueType = Object.prototype.toString.call(value)

        if (valueType === '[object Object]') {
            for (const rule of this.rules) {
                rule(value, this.errors)
            }

            for (const field in this.fields) {
                const fieldValidator = this.fields[field]
                const fieldValidateResult = fieldValidator.validate(value[field])

                if (!fieldValidateResult) {
                    this.errors = this.errors.concat(
                        fieldValidator.errors.map((val) => {
                            val.field = val.field ? [field, val.field].join('.') : field
                            return val
                        })
                    )
                }
            }
        } else {
            if ((valueType === '[object Undefined]' && this.isRequired) || valueType !== '[object Undefined]') {
                this.errors.push({ field: null, code: 'OBJECT_TYPE_ERROR', message: `Value must be type of [object Object]. ${valueType} given.` })
            }
        }

        return this.errors.length === 0
    }
}
