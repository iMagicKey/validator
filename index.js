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

    isRequired(options) {
        this.fields[this.currentField].push({
            fn: function(field, object, options) {
                if (field in object) {
                    return true
                }
                return `field "${field}" is required`
            },
            options: options
        })

        return this
    }

    isString(options) {
        this.fields[this.currentField].push({
            fn: function(field, object, options) {
                if (typeof object[field] == 'string') {
                    return true
                }
                return `field "${field}" must be 'string'`
            },
            options: options
        })

        return this
    }

    isInteger(options) {
        this.fields[this.currentField].push({
            fn: function(field, object, options) {
                if (object[field] == parseInt(object[field])) {
                    return true
                }
                return `field "${field}" must be 'integer'`
            },
            options: options
        })
        
        return this
    }

    isIn(options = []) {
        this.fields[this.currentField].push({
            fn: function(field, object, options) {
                if (options.includes(object[field])) {
                    return true
                }
                return `field "${field}" must be one of [${options.map(val => `'${val}'`).join(', ')}]`
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