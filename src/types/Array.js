export default class ValidatorArray {
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
                errors.push({ field: null, code: 'ARRAY_CUSTOM_VALIDATION', message: `Custom validation error: ${error.message}` })
            }
        })
        return this
    }

    unique() {
        this.rules.push((value, errors) => {
            const uniqueValues = new Set(value)
            if (uniqueValues.size !== value.length) {
                errors.push({ field: null, code: 'ARRAY_UNIQUE', message: 'Array elements must be unique.' })
            }
        })
        return this
    }

    in(allowedValues) {
        this.rules.push((value, errors) => {
            const invalidValues = value.filter((item) => !allowedValues.includes(item))
            if (invalidValues.length > 0) {
                errors.push({
                    code: 'ARRAY_IN',
                    message: `Array elements must be one of ${JSON.stringify(allowedValues)}. Invalid values: ${JSON.stringify(invalidValues)}.`,
                })
            }
        })
        return this
    }

    min(limit) {
        this.rules.push((value, errors) => {
            if (value.length < limit) {
                errors.push({ field: null, code: 'ARRAY_MIN_LENGTH', message: `Array must have at least ${limit} elements, ${value.length} given.` })
            }
        })
        return this
    }

    max(limit) {
        this.rules.push((value, errors) => {
            if (value.length > limit) {
                errors.push({ field: null, code: 'ARRAY_MAX_LENGTH', message: `Array must have at most ${limit} elements, ${value.length} given.` })
            }
        })
        return this
    }

    length(limit) {
        this.rules.push((value, errors) => {
            if (value.length !== limit) {
                errors.push({ field: null, code: 'ARRAY_EXACT_LENGTH', message: `Array must have exactly ${limit} elements, ${value.length} given.` })
            }
        })
        return this
    }

    validate(value) {
        this.errors = []
        const valueType = Object.prototype.toString.call(value)

        if (valueType === '[object Array]') {
            for (const rule of this.rules) {
                rule(value, this.errors)
            }
        } else {
            if ((valueType === '[object Undefined]' && this.isRequired) || valueType !== '[object Undefined]') {
                this.errors.push({ field: null, code: 'ARRAY_TYPE_ERROR', message: `Value must be type of [object Array]. ${valueType} given.` })
            }
        }

        return this.errors.length === 0
    }
}
