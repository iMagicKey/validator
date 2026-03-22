import { describe, it } from 'node:test'
import { expect } from 'chai'
import Validator from '../src/index.js'

describe('ValidatorBoolean', () => {
    it('should validate required boolean correctly', () => {
        const schema = Validator.boolean().required()

        expect(schema.validate(true)).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate(undefined)).to.be.false
        expect(schema.errors.some((error) => error.code === 'BOOLEAN_TYPE_ERROR')).to.be.true
    })

    it('should validate strict true correctly', () => {
        const schema = Validator.boolean().isTrue()

        expect(schema.validate(true)).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate(false)).to.be.false
        expect(schema.errors.some((error) => error.code === 'BOOLEAN_NOT_TRUE')).to.be.true
    })

    it('should validate strict false correctly', () => {
        const schema = Validator.boolean().isFalse()

        expect(schema.validate(false)).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate(true)).to.be.false
        expect(schema.errors.some((error) => error.code === 'BOOLEAN_NOT_FALSE')).to.be.true
    })

    it('should validate non-strict isTrue without runtime errors', () => {
        const schema = Validator.boolean({ strict: false }).isTrue()

        expect(schema.validate(1)).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate('true')).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate(0)).to.be.false
        expect(schema.errors.some((error) => error.code === 'BOOLEAN_NOT_TRUE')).to.be.true
    })

    it('should validate non-strict isFalse without runtime errors', () => {
        const schema = Validator.boolean({ strict: false }).isFalse()

        expect(schema.validate(0)).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate('false')).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate(1)).to.be.false
        expect(schema.errors.some((error) => error.code === 'BOOLEAN_NOT_FALSE')).to.be.true
    })

    it('should handle non-boolean values when required', () => {
        const schema = Validator.boolean().required()

        expect(schema.validate(123)).to.be.false
        expect(schema.errors.some((error) => error.code === 'BOOLEAN_TYPE_ERROR')).to.be.true

        expect(schema.validate('true')).to.be.false
        expect(schema.errors.some((error) => error.code === 'BOOLEAN_TYPE_ERROR')).to.be.true
    })

    it('should validate non-strict mode for string "true"', () => {
        const schema = Validator.boolean({ strict: false })

        expect(schema.validate('true')).to.be.true
        expect(schema.errors).to.be.empty
    })

    it('should validate non-strict mode for string "false"', () => {
        const schema = Validator.boolean({ strict: false })

        expect(schema.validate('false')).to.be.true
        expect(schema.errors).to.be.empty
    })

    it('should validate non-strict mode for number 1 as true', () => {
        const schema = Validator.boolean({ strict: false })

        expect(schema.validate(1)).to.be.true
        expect(schema.errors).to.be.empty
    })

    it('should validate non-strict mode for number 0 as false', () => {
        const schema = Validator.boolean({ strict: false })

        expect(schema.validate(0)).to.be.true
        expect(schema.errors).to.be.empty
    })

    it('should fail validation for invalid string in non-strict mode', () => {
        const schema = Validator.boolean({ strict: false })

        expect(schema.validate('invalid')).to.be.false
        expect(schema.errors.some((error) => error.code === 'BOOLEAN_TYPE_ERROR')).to.be.true
    })

    it('should handle optional booleans correctly', () => {
        const schema = Validator.boolean()

        expect(schema.validate(undefined)).to.be.true
        expect(schema.errors).to.be.empty
    })

    it('should validate custom function correctly', () => {
        const schema = Validator.boolean().fn((value, errors) => {
            if (value !== true) {
                errors.push({ field: null, code: 'CUSTOM_VALIDATION_FAILED', message: 'Custom validation failed.' })
            }
        })

        expect(schema.validate(true)).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate(false)).to.be.false
        expect(schema.errors.some((error) => error.code === 'CUSTOM_VALIDATION_FAILED')).to.be.true
    })

    it('should handle custom function that throws', () => {
        const schema = Validator.boolean().fn(() => {
            throw new Error('oops')
        })

        expect(schema.validate(true)).to.be.false
        expect(schema.errors.some((e) => e.code === 'BOOLEAN_CUSTOM_VALIDATION')).to.be.true
    })

    it('should validate both true and false as valid boolean values', () => {
        const schema = Validator.boolean()

        expect(schema.validate(true)).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate(false)).to.be.true
        expect(schema.errors).to.be.empty
    })
})
