import { expect } from 'chai'
import IMV from '../src/index.js'

describe('String', () => {
    it('should validate required string correctly', () => {
        const schema = IMV.string().required()

        expect(schema.validate('test')).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate(undefined)).to.be.false
        expect(schema.errors.some((error) => error.code === 'STRING_TYPE_ERROR')).to.be.true
    })

    it('should validate string length correctly', () => {
        const schema = IMV.string().length(4)

        expect(schema.validate('test')).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate('testing')).to.be.false
        expect(schema.errors.some((error) => error.code === 'STRING_LENGTH')).to.be.true
    })

    it('should validate string max length correctly', () => {
        const schema = IMV.string().max(4)

        expect(schema.validate('test')).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate('testing')).to.be.false
        expect(schema.errors.some((error) => error.code === 'STRING_MAX_LENGTH')).to.be.true
    })

    it('should validate string min length correctly', () => {
        const schema = IMV.string().min(4)

        expect(schema.validate('test')).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate('tes')).to.be.false
        expect(schema.errors.some((error) => error.code === 'STRING_MIN_LENGTH')).to.be.true
    })

    it('should validate string pattern correctly', () => {
        const schema = IMV.string().pattern(/^[a-z]+$/)

        expect(schema.validate('test')).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate('test123')).to.be.false
        expect(schema.errors.some((error) => error.code === 'STRING_PATTERN_MISMATCH')).to.be.true
    })

    it('should validate inverted string pattern correctly', () => {
        const schema = IMV.string().pattern(/^[a-z]+$/, { invert: true })

        expect(schema.validate('test123')).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate('test')).to.be.false
        expect(schema.errors.some((error) => error.code === 'STRING_PATTERN_MISMATCH')).to.be.true
    })

    it('should not validate non-string values', () => {
        const schema = IMV.string()

        expect(schema.validate(123)).to.be.false
        expect(schema.errors.some((error) => error.code === 'STRING_TYPE_ERROR')).to.be.true
    })

    it('should validate string custom validator correctly', () => {
        const schema = IMV.string().fn((value, errors) => {
            if (value.startsWith('1')) {
                errors.push({ field: null, code: 'CUSTOM_ERROR', message: 'Custom message' })
            }
        })

        expect(schema.validate('245')).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate('123')).to.be.false
        expect(schema.errors.some((error) => error.code === 'CUSTOM_ERROR')).to.be.true
    })

    it('should validate string custom validator error', () => {
        const schema = IMV.string().fn(() => {
            throw Error()
        })
        expect(schema.validate('123')).to.be.false
        expect(schema.errors.some((error) => error.code === 'STRING_CUSTOM_VALIDATION')).to.be.true
    })
})
