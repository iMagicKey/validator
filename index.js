class Validator {
    constructor() {
        this.fields = {}
        this.currentField = null
    }

    field(name) {
        this.fields[name] = []
        this.currentField = name

        return this
    }

    required(options) {
        this.fields[this.currentField].push({
            fn: function(field, object, options) {
                if (field in object == false) {
                    return `The "${field}" field is required`
                }

                return true
            },
            options: options
        })

        return this
    }

    string(options) {
        const _options = {
            minLength: false,
            maxLength: false,
            ...options
        }

        this.fields[this.currentField].push({
            fn: function(field, object, options) {
                if (typeof object[field] == 'string' == false) {
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
            options: options
        })

        return this
    }

    integer(options) {
        const _options = {
            minValue: false,
            maxValue: false,
            ...options
        }

        this.fields[this.currentField].push({
            fn: function(field, object, options) {
                if (object[field] != parseInt(object[field])) {
                    return `The "${field}" must be a "integer"`
                }

                if (_options.minValue !== false && object[field] < _options.minValue) {
                    return `The "${field}" must not be less than ${_options.minValue}`
                }

                if (_options.maxValue !== false && object[field] > _options.maxValue) {
                    return `The "${field}" must not be greater than ${_options.maxValue}`
                }
                
                return true
                
            },
            options: options
        })
        
        return this
    }

    in(options = []) {
        this.fields[this.currentField].push({
            fn: function(field, object, options) {
                if (options.includes(object[field]) == false) {
                    return `The  "${field}" field does not exist in [${options.map(val => `'${val}'`).join(', ')}]`
                }

                return true
            },
            options: options
        })
        
        return this
    }

    boolean(options) {
        const _options = {
            value: null,
            ...options
        }

        this.fields[this.currentField].push({
            fn: function(field, object, options) {
                let isTrue = object[field] === true || object[field] === 1
                let isFalse = object[field] === false || object[field] === 0

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
            },
            options: options
        })
        
        return this
    }

    array(options) {
        const _options = {
            minLength: false,
            maxLength: false,
            ...options
        }

        this.fields[this.currentField].push({
            fn: function(field, object, options) {

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
            options: options
        })
        
        return this
    }
    
    validate(object) {
        let valid = true
        let errors = []

        for (let field in this.fields) {
            for (let index in this.fields[field]) {
                let result = this.fields[field][index].fn(field, object, this.fields[field][index].options)
                if (result !== true) {
                    valid = false
                    errors.push(result)
                }
            }
        }

        return valid || errors
    }
    // isString()
    // isBoolean()
    // isEmail
    // isEmpty
    // isFloat
    // isJSON
}

module.exports = Validator