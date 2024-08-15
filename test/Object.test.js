import { expect } from 'chai'
import IMV from '../src/index.js'

describe('ValidatorObject', () => {
    it('should validate object length correctly', () => {
        const schema = IMV.object().length(3)

        expect(schema.validate({ a: 1, b: 2, c: 3 })).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate({ a: 1, b: 2 })).to.be.false
        expect(schema.errors.some((error) => error.code === 'OBJECT_KEYS_LENGTH')).to.be.true
    })

    it('should validate object max keys correctly', () => {
        const schema = IMV.object().max(2)

        expect(schema.validate({ a: 1, b: 2 })).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate({ a: 1, b: 2, c: 3 })).to.be.false
        expect(schema.errors.some((error) => error.code === 'OBJECT_KEYS_MAX')).to.be.true
    })

    it('should validate object min keys correctly', () => {
        const schema = IMV.object().min(2)

        expect(schema.validate({ a: 1, b: 2 })).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate({ a: 1 })).to.be.false
        expect(schema.errors.some((error) => error.code === 'OBJECT_KEYS_MIN')).to.be.true
    })

    it('should validate nested fields correctly', () => {
        const schema = IMV.object({
            nested: IMV.object().length(2),
        })

        expect(schema.validate({ nested: { a: 1, b: 2 } })).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate({ nested: { a: 1 } })).to.be.false
        expect(schema.errors.some((error) => error.code === 'OBJECT_KEYS_LENGTH' && error.field === 'nested')).to.be.true
    })

    it('should validate non-object values correctly', () => {
        const schema = IMV.object().required()

        expect(schema.validate('string')).to.be.false
        expect(schema.errors.some((error) => error.code === 'OBJECT_TYPE_ERROR')).to.be.true

        expect(schema.validate(null)).to.be.false
        expect(schema.errors.some((error) => error.code === 'OBJECT_TYPE_ERROR')).to.be.true
    })

    it('should validate object custom validator correctly', () => {
        const schema = IMV.object().fn((value, errors) => {
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
        const schema = IMV.object().fn(() => {
            throw Error()
        })
        expect(schema.validate({ a: 1, b: 2, c: 3 })).to.be.false
        expect(schema.errors.some((error) => error.code === 'OBJECT_CUSTOM_VALIDATION')).to.be.true
    })

    it('should validate required object', () => {
        const schema = IMV.object().required()

        expect(schema.validate({})).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate(undefined)).to.be.false
        expect(schema.errors.some((error) => error.code === 'OBJECT_TYPE_ERROR')).to.be.true
    })

    it('should validate not required object', () => {
        const schema = IMV.object()

        expect(schema.validate({})).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate(undefined)).to.be.true
        expect(schema.errors).to.be.empty
    })
})
