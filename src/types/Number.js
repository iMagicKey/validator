export default class ValidatorNumber {
    constructor(options) {
        this.rules = []
        this.errors = []
        this.allowInfinity = options?.allowInfinity ?? true
        this.allowNaN = options?.allowNaN ?? true
        this.allowUnsafe = options?.allowUnsafe ?? true
        this.isRequired = false
        this.applyGeneralRules()
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
                errors.push(`Custom validation error: ${error.message}`)
            }
        })
        return this
    }

    max(limit) {
        this.rules.push((value, errors) => {
            if (value > limit) {
                errors.push(`Number must be at most ${limit}.`)
            }
        })

        return this
    }

    min(limit) {
        this.rules.push((value, errors) => {
            if (value < limit) {
                errors.push(`Number must be at least ${limit}.`)
            }
        })

        return this
    }

    applyGeneralRules() {
        this.rules.push((value, errors) => {
            if (!this.allowUnsafe && !Number.isSafeInteger(value)) {
                errors.push('Value must be a safe integer.')
            }
        })

        this.rules.push((value, errors) => {
            if (!this.allowNaN && Number.isNaN(value)) {
                errors.push('NaN is not allowed.')
            }
        })

        this.rules.push((value, errors) => {
            if (!this.allowInfinity && !Number.isFinite(value)) {
                errors.push('Infinity and -Infinity are not allowed.')
            }
        })
    }

    validate(value) {
        this.errors = []
        const valueType = Object.prototype.toString.call(value)

        if (valueType === '[object Number]') {
            for (const rule of this.rules) {
                rule(value, this.errors)
            }
        } else {
            if ((valueType === '[object Undefined]' && this.isRequired) || valueType !== '[object Undefined]') {
                this.errors.push(`Value must be type of [object Number]. ${valueType} given.`)
            }
        }

        return this.errors.length === 0
    }
}
