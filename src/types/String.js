export default class ValidatorString {
    constructor() {
        this.rules = []
        this.errors = []
        this.isRequired = false
        this.isNullable = false
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
                errors.push({ field: null, code: 'STRING_CUSTOM_VALIDATION', message: `Custom validation error: ${error.message}` })
            }
        })
        return this
    }

    length(limit) {
        this.rules.push((value, errors) => {
            if (value.length !== limit) {
                errors.push({
                    field: null,
                    code: 'STRING_LENGTH',
                    message: `Value must have a length of ${limit} characters, ${value.length} given.`,
                })
            }
        })
        return this
    }

    max(limit) {
        this.rules.push((value, errors) => {
            if (value.length > limit) {
                errors.push({
                    field: null,
                    code: 'STRING_MAX_LENGTH',
                    message: `Value must have at most ${limit} characters, ${value.length} given.`,
                })
            }
        })
        return this
    }

    min(limit) {
        this.rules.push((value, errors) => {
            if (value.length < limit) {
                errors.push({
                    field: null,
                    code: 'STRING_MIN_LENGTH',
                    message: `Value must have at least ${limit} characters, ${value.length} given.`,
                })
            }
        })
        return this
    }

    in(allowedValues) {
        this.rules.push((value, errors) => {
            if (!allowedValues.includes(value)) {
                errors.push({
                    field: null,
                    code: 'STRING_IN',
                    message: `Value must be one of ${JSON.stringify(allowedValues)}. Invalid values: ${JSON.stringify(value)}.`,
                })
            }
        })
        return this
    }

    pattern(pattern, options) {
        this.rules.push((value, errors) => {
            if ((value === null && this.isNullable) || value === undefined) {
                return
            }

            const { invert } = options || {}
            const patternRegex = pattern instanceof RegExp ? pattern : new RegExp(pattern)

            const isMatching = patternRegex.test(value)
            if ((invert && isMatching) || (!invert && !isMatching)) {
                errors.push({
                    field: null,
                    code: 'STRING_PATTERN_MISMATCH',
                    message: `Value fails to match the specified pattern "${patternRegex}".`,
                })
            }
        })
        return this
    }

    ip({ v4 = true, v6 = true } = {}) {
        const oct = '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)'
        const ipv4Regex = new RegExp(`^${oct}\\.${oct}\\.${oct}\\.${oct}$`)

        const h = '[0-9a-fA-F]{1,4}'
        const ipv4 = `((25[0-5]|(2[0-4]|1?[0-9])?[0-9])\\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9])`
        const ipv6Parts = [
            `(${h}:){7}${h}`,
            `(${h}:){1,7}:`,
            `(${h}:){1,6}:${h}`,
            `(${h}:){1,5}(:${h}){1,2}`,
            `(${h}:){1,4}(:${h}){1,3}`,
            `(${h}:){1,3}(:${h}){1,4}`,
            `(${h}:){1,2}(:${h}){1,5}`,
            `${h}:((:${h}){1,6})`,
            `:((:${h}){1,7}|:)`,
            `fe80:(:${h.replace('{1,4}', '{0,4}')}){0,4}%[0-9a-zA-Z]{1,}`,
            `::(ffff(:0{1,4})?:)?${ipv4}`,
            `(${h}:){1,4}:${ipv4}`,
        ]
        const ipv6Regex = new RegExp(`^(${ipv6Parts.join('|')})$`)

        this.rules.push((value, errors) => {
            const isIPv4 = ipv4Regex.test(value)
            const isIPv6 = ipv6Regex.test(value)

            const valid = (v4 && isIPv4) || (v6 && isIPv6)

            if (!valid) {
                errors.push({
                    field: null,
                    code: 'STRING_IP_FORMAT',
                    message: `Value is not a valid IP${v4 && !v6 ? 'v4' : v6 && !v4 ? 'v6' : ''} address.`,
                })
            }
        })
        return this
    }

    validate(value) {
        this.errors = []

        const valueType = Object.prototype.toString.call(value)

        if (valueType === '[object Null]' && this.isNullable) {
            return true
        }

        if (valueType === '[object String]') {
            for (const rule of this.rules) {
                rule(value, this.errors)
            }
        } else {
            if ((valueType === '[object Undefined]' && this.isRequired) || valueType !== '[object Undefined]') {
                this.errors.push({ field: null, code: 'STRING_TYPE_ERROR', message: `Value must be type of [object String]. ${valueType} given.` })
            }
        }

        return this.errors.length === 0
    }
}
