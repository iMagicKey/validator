export default class ValidatorObject {
    constructor(fields = {}) {
        this.rules = []
        this.errors = {
            _self: [],
        }
        this.fields = fields
    }

    length(limit) {
        this.rules.push((value, errors) => {
            const keys = Object.keys(value)
            if (keys.length !== limit) {
                errors.push(`Object must have exactly ${limit} keys, ${keys.length} given.`)
            }
        })
        return this
    }

    max(limit) {
        this.rules.push((value, errors) => {
            const keys = Object.keys(value)
            if (Object.keys(value).length > limit) {
                errors.push(`Object must have at most ${limit} keys, ${keys.length} given.`)
            }
        })
        return this
    }

    min(limit) {
        this.rules.push((value, errors) => {
            const keys = Object.keys(value)
            if (keys.length < limit) {
                errors.push(`Object must have at least ${limit} keys, ${keys.length} given.`)
            }
        })
        return this
    }

    validate(value) {
        this.errors = {
            _self: [],
        }

        const valueType = Object.prototype.toString.call(value)
        if (valueType !== '[object Object]') {
            this.errors._self.push(`Value must be type of [object Object]. ${valueType} given.`)
        } else {
            for (const rule of this.rules) {
                rule(value, this.errors._self)
            }

            for (const field in this.fields) {
                const fieldValidator = this.fields[field]
                const fieldValidateResult = fieldValidator.validate(value[field])

                if (!fieldValidateResult) {
                    this.errors[field] = fieldValidator.errors
                }
            }
        }

        return this.errors._self.length === 0 && Object.keys(this.errors).length === 1
    }
}
