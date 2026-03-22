import { describe, it } from 'node:test'
import { expect } from 'chai'
import Validator from '../src/index.js'

describe('ValidatorArray', () => {
    it('should validate required array correctly', () => {
        const schema = Validator.array().required()
        expect(schema.validate([1, 2, 3])).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate(undefined)).to.be.false
        expect(schema.errors.some((error) => error.code === 'ARRAY_TYPE_ERROR')).to.be.true
    })

    it('should validate unique elements in array correctly', () => {
        const schema = Validator.array().unique()

        expect(schema.validate([1, 2, 3])).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate([1, 2, 2])).to.be.false
        expect(schema.errors.some((error) => error.code === 'ARRAY_UNIQUE')).to.be.true
    })

    it('should validate elements in allowed values correctly', () => {
        const schema = Validator.array().in([1, 2, 3])

        expect(schema.validate([1, 2])).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate([1, 4])).to.be.false
        expect(schema.errors.some((error) => error.code === 'ARRAY_IN')).to.be.true
    })

    it('should validate minimum array length correctly', () => {
        const schema = Validator.array().min(2)

        expect(schema.validate([1, 2])).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate([1])).to.be.false
        expect(schema.errors.some((error) => error.code === 'ARRAY_MIN_LENGTH')).to.be.true
    })

    it('should skip array rules for null when nullable is allowed', () => {
        const schema = Validator.array().nullable().min(1)

        expect(schema.validate(null)).to.be.true
        expect(schema.errors).to.be.empty
    })

    it('should validate maximum array length correctly', () => {
        const schema = Validator.array().max(2)

        expect(schema.validate([1, 2])).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate([1, 2, 3])).to.be.false
        expect(schema.errors.some((error) => error.code === 'ARRAY_MAX_LENGTH')).to.be.true
    })

    it('should validate exact array length correctly', () => {
        const schema = Validator.array().length(2)

        expect(schema.validate([1, 2])).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate([1, 2, 3])).to.be.false
        expect(schema.errors.some((error) => error.code === 'ARRAY_EXACT_LENGTH')).to.be.true
    })

    it('should handle non-array values when required', () => {
        const schema = Validator.array().required()

        expect(schema.validate('not an array')).to.be.false
        expect(schema.errors.some((error) => error.code === 'ARRAY_TYPE_ERROR')).to.be.true
    })

    it('should handle optional arrays correctly', () => {
        const schema = Validator.array()

        expect(schema.validate(undefined)).to.be.true
        expect(schema.errors).to.be.empty
    })

    it('should validate array custom validator correctly', () => {
        const schema = Validator.array().fn((value, errors) => {
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
        const schema = Validator.array().fn(() => {
            throw Error()
        })
        expect(schema.validate([1, 2, 3])).to.be.false
        expect(schema.errors.some((error) => error.code === 'ARRAY_CUSTOM_VALIDATION')).to.be.true
    })

    it('should validate nested number items', () => {
        const schema = Validator.array(Validator.number({ allowNaN: true, allowInfinity: true }).min(5).max(10)).required()

        expect(schema.validate([5, 6, 7])).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate([4, 11])).to.be.false
        expect(schema.errors.some((err) => err.code === 'NUMBER_MIN' && err.field === '[0]')).to.be.true
        expect(schema.errors.some((err) => err.code === 'NUMBER_MAX' && err.field === '[1]')).to.be.true
    })

    it('should validate nested string items', () => {
        const schema = Validator.array(Validator.string().min(2).max(5)).required()

        expect(schema.validate(['hi', 'hello'])).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate(['a', 'toolong'])).to.be.false
        expect(schema.errors.some((err) => err.code === 'STRING_MIN_LENGTH' && err.field === '[0]')).to.be.true
        expect(schema.errors.some((err) => err.code === 'STRING_MAX_LENGTH' && err.field === '[1]')).to.be.true
    })

    it('should validate nested object items', () => {
        const schema = Validator.array(
            Validator.object({
                name: Validator.string().required().min(1),
                age: Validator.number({ allowNaN: true, allowInfinity: true }).min(18),
            })
        ).required()

        expect(
            schema.validate([
                { name: 'Alice', age: 25 },
                { name: 'Bob', age: 18 },
            ])
        ).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate([{ name: '', age: 17 }, { age: 30 }])).to.be.false

        expect(schema.errors.some((err) => err.code === 'STRING_MIN_LENGTH' && err.field === '[0].name')).to.be.true
        expect(schema.errors.some((err) => err.code === 'NUMBER_MIN' && err.field === '[0].age')).to.be.true
        expect(schema.errors.some((err) => err.code === 'STRING_TYPE_ERROR' && err.field === '[1].name')).to.be.true
    })

    it('should accept null if nullable is allowed', () => {
        const schema = Validator.array().nullable()
        expect(schema.validate(null)).to.be.true
        expect(schema.errors).to.be.empty
    })

    it('should reject null if nullable is not allowed', () => {
        const schema = Validator.array()
        expect(schema.validate(null)).to.be.false
        expect(schema.errors.some((e) => e.code === 'ARRAY_TYPE_ERROR')).to.be.true
    })

    it('should validate empty array', () => {
        const schema = Validator.array()
        expect(schema.validate([])).to.be.true
        expect(schema.errors).to.be.empty
    })

    it('ARRAY_IN error must include field: null', () => {
        const schema = Validator.array().in([[1, 2]])
        expect(schema.validate([[3]])).to.be.false
        const err = schema.errors.find((e) => e.code === 'ARRAY_IN')
        expect(err).to.exist
        expect(err).to.have.property('field', null)
    })
})
