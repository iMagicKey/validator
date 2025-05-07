export default class ValidatorDate {
    constructor(options = {}) {
        this.rules = []
        this.errors = []
        this.isRequired = false
        this.isNullable = false
        this.allowString = options.string ?? true
        this.allowNumber = options.number ?? true
    }

    required() {
        this.isRequired = true
        return this
    }

    nullable() {
        this.isNullable = true
        return this
    }

    fn(rule) {
        this.rules.push((value, errors) => {
            try {
                rule(value, errors)
            } catch (error) {
                errors.push({ field: null, code: 'DATE_CUSTOM_VALIDATION', message: `Custom validation error: ${error.message}` })
            }
        })
        return this
    }

    min(date) {
        this.rules.push((value, errors) => {
            const d = this.toDate(value)
            const minDate = new Date(date)
            if (d && d < minDate) {
                errors.push({ field: null, code: 'DATE_MIN', message: `Date must be after ${minDate.toISOString()}.` })
            }
        })
        return this
    }

    max(date) {
        this.rules.push((value, errors) => {
            const d = this.toDate(value)
            const maxDate = new Date(date)
            if (d && d > maxDate) {
                errors.push({ field: null, code: 'DATE_MAX', message: `Date must be before ${maxDate.toISOString()}.` })
            }
        })
        return this
    }

    toDate(value) {
        const valueType = Object.prototype.toString.call(value)

        if (valueType === '[object String]' && this.allowString) {
            value = new Date(value)
            return isNaN(value.getTime()) ? null : value
        }

        if (valueType === '[object Number]' && this.allowNumber) {
            value = new Date(value)
            return isNaN(value.getTime()) ? null : value
        }

        if (valueType === '[object Date]') {
            return isNaN(value.getTime()) ? null : value
        }

        return null
    }

    validate(value) {
        this.errors = []
        const valueType = Object.prototype.toString.call(value)

        if (valueType === '[object Null]' && this.isNullable) {
            return true
        }

        if (valueType === '[object String]' && this.allowString) {
            value = new Date(value)
        }

        if (valueType === '[object Number]' && this.allowNumber) {
            value = new Date(value)
        }

        const formatedType = Object.prototype.toString.call(value)

        if (formatedType === '[object Date]') {
            if (isNaN(value.getTime())) {
                this.errors.push({
                    field: null,
                    code: 'DATE_TYPE_ERROR',
                    message: `Value must be a valid ${valueType} date.`,
                })

                return false
            }

            for (const rule of this.rules) {
                rule(value, this.errors)
            }
        } else {
            if ((formatedType === '[object Undefined]' && this.isRequired) || formatedType !== '[object Undefined]') {
                this.errors.push({
                    field: null,
                    code: 'DATE_TYPE_ERROR',
                    message: `Value must be one of types [object Date] [object String] [object Number]. ${formatedType} given.`,
                })
            }
        }

        return this.errors.length === 0
    }
}
