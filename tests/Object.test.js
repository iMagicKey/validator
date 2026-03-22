import { describe, it } from 'node:test'
import { expect } from 'chai'
import Validator from '../src/index.js'

describe('ValidatorObject', () => {
    it('should validate object length correctly', () => {
        const schema = Validator.object().length(3)

        expect(schema.validate({ a: 1, b: 2, c: 3 })).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate({ a: 1, b: 2 })).to.be.false
        expect(schema.errors.some((error) => error.code === 'OBJECT_KEYS_LENGTH')).to.be.true
    })

    it('should validate object strict mode correctly', () => {
        const schema = Validator.object({
            name: Validator.string().required(),
            age: Validator.number(),
        }).strict()

        expect(schema.validate({ name: 'John', age: 30 })).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate({ name: 'John', age: 30, extra: true })).to.be.false
        expect(schema.errors.some((error) => error.code === 'OBJECT_EXTRA_KEYS')).to.be.true
    })

    it('should validate object max keys correctly', () => {
        const schema = Validator.object().max(2)

        expect(schema.validate({ a: 1, b: 2 })).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate({ a: 1, b: 2, c: 3 })).to.be.false
        expect(schema.errors.some((error) => error.code === 'OBJECT_KEYS_MAX')).to.be.true
    })

    it('should validate object min keys correctly', () => {
        const schema = Validator.object().min(2)

        expect(schema.validate({ a: 1, b: 2 })).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate({ a: 1 })).to.be.false
        expect(schema.errors.some((error) => error.code === 'OBJECT_KEYS_MIN')).to.be.true
    })

    it('should skip object rules for null when nullable is allowed', () => {
        const schema = Validator.object().nullable().min(1)

        expect(schema.validate(null)).to.be.true
        expect(schema.errors).to.be.empty
    })

    it('should validate nested fields correctly', () => {
        const schema = Validator.object({
            nested: Validator.object().length(2),
        })

        expect(schema.validate({ nested: { a: 1, b: 2 } })).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate({ nested: { a: 1 } })).to.be.false
        expect(schema.errors.some((error) => error.code === 'OBJECT_KEYS_LENGTH' && error.field === 'nested')).to.be.true
    })

    it('should validate non-object values correctly', () => {
        const schema = Validator.object().required()

        expect(schema.validate('string')).to.be.false
        expect(schema.errors.some((error) => error.code === 'OBJECT_TYPE_ERROR')).to.be.true

        expect(schema.validate(null)).to.be.false
        expect(schema.errors.some((error) => error.code === 'OBJECT_TYPE_ERROR')).to.be.true
    })

    it('should validate object custom validator correctly', () => {
        const schema = Validator.object().fn((value, errors) => {
            if (Object.keys(value).includes('c')) {
                errors.push({ field: null, code: 'CUSTOM_ERROR', message: 'Custom message' })
            }
        })

        expect(schema.validate({ a: 1, b: 2 })).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate({ a: 1, b: 2, c: 3 })).to.be.false
        expect(schema.errors.some((error) => error.code === 'CUSTOM_ERROR')).to.be.true
    })

    it('should validate object custom validator error', () => {
        const schema = Validator.object().fn(() => {
            throw Error()
        })
        expect(schema.validate({ a: 1, b: 2, c: 3 })).to.be.false
        expect(schema.errors.some((error) => error.code === 'OBJECT_CUSTOM_VALIDATION')).to.be.true
    })

    it('should validate required object', () => {
        const schema = Validator.object().required()

        expect(schema.validate({})).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate(undefined)).to.be.false
        expect(schema.errors.some((error) => error.code === 'OBJECT_TYPE_ERROR')).to.be.true
    })

    it('should validate not required object', () => {
        const schema = Validator.object()

        expect(schema.validate({})).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate(undefined)).to.be.true
        expect(schema.errors).to.be.empty
    })

    it('should accept null if nullable is allowed', () => {
        const schema = Validator.object().nullable()
        expect(schema.validate(null)).to.be.true
        expect(schema.errors).to.be.empty
    })

    it('should reject null if nullable is not allowed', () => {
        const schema = Validator.object()
        expect(schema.validate(null)).to.be.false
        expect(schema.errors.some((e) => e.code === 'OBJECT_TYPE_ERROR')).to.be.true
    })

    it('should reset errors on each validate call (Bug 2)', () => {
        const schema = Validator.object().required()

        expect(schema.validate(undefined)).to.be.false
        expect(schema.errors).to.have.lengthOf(1)

        expect(schema.validate(undefined)).to.be.false
        expect(schema.errors).to.have.lengthOf(1)

        expect(schema.validate({})).to.be.true
        expect(schema.errors).to.be.empty
    })

    it('child validator errors are not mutated after parent validate call', () => {
        const childValidator = Validator.string().required().min(3)
        const parentValidator = Validator.object({ name: childValidator })

        parentValidator.validate({ name: 'x' })
        // After parent validation, child errors should still have field: null (not 'name')
        const childErr = childValidator.errors.find((e) => e.code === 'STRING_MIN_LENGTH')
        expect(childErr).to.exist
        expect(childErr).to.have.property('field', null)

        // Validate child directly — should still produce field: null
        childValidator.validate('ab')
        const directErr = childValidator.errors.find((e) => e.code === 'STRING_MIN_LENGTH')
        expect(directErr).to.exist
        expect(directErr).to.have.property('field', null)
    })

    it('should validate complex nested object', () => {
        const schema = Validator.object({
            user: Validator.object({
                name: Validator.string().required().min(1),
                age: Validator.number().min(0),
            }).required(),
        })

        expect(schema.validate({ user: { name: 'Alice', age: 25 } })).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate({ user: { name: '', age: -1 } })).to.be.false
        expect(schema.errors.some((e) => e.code === 'STRING_MIN_LENGTH' && e.field === 'user.name')).to.be.true
        expect(schema.errors.some((e) => e.code === 'NUMBER_MIN' && e.field === 'user.age')).to.be.true
    })
})
