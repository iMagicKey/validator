import { expect } from 'chai'
import IMV from '../src/index.js'

describe('Array', () => {
    it('should validate required array correctly', () => {
        const schema = IMV.array().required()
        expect(schema.validate([1, 2, 3])).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate(undefined)).to.be.false
        expect(schema.errors.some((error) => error.code === 'ARRAY_TYPE_ERROR')).to.be.true
    })

    it('should validate unique elements in array correctly', () => {
        const schema = IMV.array().unique()

        expect(schema.validate([1, 2, 3])).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate([1, 2, 2])).to.be.false
        expect(schema.errors.some((error) => error.code === 'ARRAY_UNIQUE')).to.be.true
    })

    it('should validate elements in allowed values correctly', () => {
        const schema = IMV.array().in([1, 2, 3])

        expect(schema.validate([1, 2])).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate([1, 4])).to.be.false
        expect(schema.errors.some((error) => error.code === 'ARRAY_IN')).to.be.true
    })

    it('should validate minimum array length correctly', () => {
        const schema = IMV.array().min(2)

        expect(schema.validate([1, 2])).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate([1])).to.be.false
        expect(schema.errors.some((error) => error.code === 'ARRAY_MIN_LENGTH')).to.be.true
    })

    it('should validate maximum array length correctly', () => {
        const schema = IMV.array().max(2)

        expect(schema.validate([1, 2])).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate([1, 2, 3])).to.be.false
        expect(schema.errors.some((error) => error.code === 'ARRAY_MAX_LENGTH')).to.be.true
    })

    it('should validate exact array length correctly', () => {
        const schema = IMV.array().length(2)

        expect(schema.validate([1, 2])).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate([1, 2, 3])).to.be.false
        expect(schema.errors.some((error) => error.code === 'ARRAY_EXACT_LENGTH')).to.be.true
    })

    it('should handle non-array values when required', () => {
        const schema = IMV.array().required()

        expect(schema.validate('not an array')).to.be.false
        expect(schema.errors.some((error) => error.code === 'ARRAY_TYPE_ERROR')).to.be.true
    })

    it('should handle optional arrays correctly', () => {
        const schema = IMV.array()

        expect(schema.validate(undefined)).to.be.true
        expect(schema.errors).to.be.empty
    })

    it('should validate array custom validator correctly', () => {
        const schema = IMV.array().fn((value, errors) => {
            if (value.includes(3)) {
                errors.push({ field: null, code: 'CUSTOM_ERROR', message: 'Custom message' })
            }
        })

        expect(schema.validate([1, 2])).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate([1, 2, 3])).to.be.false
        expect(schema.errors.some((error) => error.code === 'CUSTOM_ERROR')).to.be.true
    })

    it('should validate array custom validator error', () => {
        const schema = IMV.array().fn(() => {
            throw Error()
        })
        expect(schema.validate([1, 2, 3])).to.be.false
        expect(schema.errors.some((error) => error.code === 'ARRAY_CUSTOM_VALIDATION')).to.be.true
    })
})
