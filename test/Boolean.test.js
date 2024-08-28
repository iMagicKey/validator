import { expect } from 'chai'
import IMV from '../src/index.js'

describe('Boolean', () => {
    it('should validate required boolean correctly', () => {
        const schema = IMV.boolean().required()

        expect(schema.validate(true)).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate(undefined)).to.be.false
        expect(schema.errors.some((error) => error.code === 'BOOLEAN_TYPE_ERROR')).to.be.true
    })

    it('should validate strict true correctly', () => {
        const schema = IMV.boolean().isTrue()

        expect(schema.validate(true)).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate(false)).to.be.false
        expect(schema.errors.some((error) => error.code === 'BOOLEAN_NOT_TRUE')).to.be.true
    })

    it('should validate strict false correctly', () => {
        const schema = IMV.boolean().isFalse()

        expect(schema.validate(false)).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate(true)).to.be.false
        expect(schema.errors.some((error) => error.code === 'BOOLEAN_NOT_FALSE')).to.be.true
    })

    it('should handle non-boolean values when required', () => {
        const schema = IMV.boolean().required()

        expect(schema.validate(123)).to.be.false
        expect(schema.errors.some((error) => error.code === 'BOOLEAN_TYPE_ERROR')).to.be.true

        expect(schema.validate('true')).to.be.false
        expect(schema.errors.some((error) => error.code === 'BOOLEAN_TYPE_ERROR')).to.be.true
    })

    it('should validate non-strict mode for string "true"', () => {
        const schema = IMV.boolean({ strict: false })

        expect(schema.validate('true')).to.be.true
        expect(schema.errors).to.be.empty
    })

    it('should validate non-strict mode for string "false"', () => {
        const schema = IMV.boolean({ strict: false })

        expect(schema.validate('false')).to.be.true
        expect(schema.errors).to.be.empty
    })

    it('should validate non-strict mode for number 1 as true', () => {
        const schema = IMV.boolean({ strict: false })

        expect(schema.validate(1)).to.be.true
        expect(schema.errors).to.be.empty
    })

    it('should validate non-strict mode for number 0 as false', () => {
        const schema = IMV.boolean({ strict: false })

        expect(schema.validate(0)).to.be.true
        expect(schema.errors).to.be.empty
    })

    it('should fail validation for invalid string in non-strict mode', () => {
        const schema = IMV.boolean({ strict: false })

        expect(schema.validate('invalid')).to.be.false
        expect(schema.errors.some((error) => error.code === 'BOOLEAN_TYPE_ERROR')).to.be.true
    })

    it('should handle optional booleans correctly', () => {
        const schema = IMV.boolean()

        expect(schema.validate(undefined)).to.be.true
        expect(schema.errors).to.be.empty
    })

    it('should validate custom function correctly', () => {
        const schema = IMV.boolean().fn((value, errors) => {
            if (value !== true) {
                errors.push({ field: null, code: 'CUSTOM_VALIDATION_FAILED', message: 'Custom validation failed.' })
            }
        })

        expect(schema.validate(true)).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate(false)).to.be.false
        expect(schema.errors.some((error) => error.code === 'CUSTOM_VALIDATION_FAILED')).to.be.true
    })
})
