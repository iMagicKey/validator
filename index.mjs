class Validator {
    constructor() {
        this.fields = {}
        this.currentField = null
        this.errors = []
    }

    static init() {
        return new this()
    }

    field(name) {
        this.fields[name] = []
        this.currentField = name

        return this
    }

    addValidation(field, validationFn, options) {
        this.fields[this.currentField].push({ field, validationFn, options })

        return this
    }

    required() {
        this.addValidation(this.currentField, (field, object) => {
            if (field in object === false) {
                return `The "${field}" field is required`
            }
            return true
        })
        return this
    }

    string(options) {
        const _options = {
            minLength: false,
            maxLength: false,
            ...options,
        }

        this.addValidation(
            this.currentField,
            (field, object) => {
                if (typeof object[field] !== 'string') {
                    return `The "${field}" must be a "string"`
                }

                if (_options.minLength !== false && object[field].length < _options.minLength) {
                    return `The "${field}" must be at least ${_options.minLength} characters`
                }

                if (_options.maxLength !== false && object[field].length > _options.maxLength) {
                    return `The "${field}" must not be greater than ${_options.maxLength} characters`
                }

                return true
            },
            options
        )
        return this
    }

    integer(options) {
        const _options = {
            minValue: false,
            maxValue: false,
            ...options,
        }

        this.addValidation(
            this.currentField,
            (field, object) => {
                if (object[field] !== parseInt(object[field])) {
                    return `The "${field}" must be an "integer"`
                }

                if (_options.minValue !== false && object[field] < _options.minValue) {
                    return `The "${field}" must not be less than ${_options.minValue}`
                }

                if (_options.maxValue !== false && object[field] > _options.maxValue) {
                    return `The "${field}" must not be greater than ${_options.maxValue}`
                }

                return true
            },
            options
        )
        return this
    }

    in(options = []) {
        this.addValidation(this.currentField, (field, object) => {
            if (!options.includes(object[field])) {
                return `The "${field}" field does not exist in [${options.map((val) => `'${val}'`).join(', ')}]`
            }
            return true
        })
        return this
    }

    boolean(options) {
        const _options = {
            value: null,
            ...options,
        }

        this.addValidation(this.currentField, (field, object) => {
            const fieldValue = object[field]
            const isTrue = fieldValue === true || fieldValue === 1
            const isFalse = fieldValue === false || fieldValue === 0

            if (_options.value === true && isTrue === false) {
                return `The "${field}" field must be "true"`
            }

            if (_options.value === false && isFalse === false) {
                return `The "${field}" field must be "false"`
            }

            if (_options.value === null && isFalse === false && isTrue === false) {
                return `The "${field}" field must be "true" or "false"`
            }

            return true
        })
        return this
    }

    array(options) {
        const _options = {
            minLength: false,
            maxLength: false,
            ...options,
        }

        this.addValidation(
            this.currentField,
            (field, object) => {
                if (Array.isArray(object[field]) === false) {
                    return `The "${field}" must be an "array"`
                }

                if (_options.minLength !== false && object[field].length < _options.minLength) {
                    return `The "${field}" must have ${_options.minLength} items or more`
                }

                if (_options.maxLength !== false && object[field].length > _options.maxLength) {
                    return `The "${field}" must not have more than ${_options.maxLength} items`
                }

                return true
            },
            options
        )
        return this
    }

    validate(object) {
        this.errors = []

        for (const field in this.fields) {
            for (const validation of this.fields[field]) {
                const result = validation.validationFn(field, object)
                if (result !== true) {
                    this.errors.push(result)
                }
            }
        }

        return this.errors.length === 0
    }

    // isString()
    // isBoolean()
    // isEmail
    // isEmpty
    // isFloat
    // isJSON
}

export default Validator
