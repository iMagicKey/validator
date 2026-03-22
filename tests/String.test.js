import { describe, it } from 'node:test'
import { expect } from 'chai'
import Validator from '../src/index.js'

describe('ValidatorString', () => {
    it('should validate required string correctly', () => {
        const schema = Validator.string().required()

        expect(schema.validate('test')).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate(undefined)).to.be.false
        expect(schema.errors.some((error) => error.code === 'STRING_TYPE_ERROR')).to.be.true
    })

    it('should validate string length correctly', () => {
        const schema = Validator.string().length(4)

        expect(schema.validate('test')).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate('testing')).to.be.false
        expect(schema.errors.some((error) => error.code === 'STRING_LENGTH')).to.be.true
    })

    it('should validate string max length correctly', () => {
        const schema = Validator.string().max(4)

        expect(schema.validate('test')).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate('testing')).to.be.false
        expect(schema.errors.some((error) => error.code === 'STRING_MAX_LENGTH')).to.be.true
    })

    it('should validate string min length correctly', () => {
        const schema = Validator.string().min(4)

        expect(schema.validate('test')).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate('tes')).to.be.false
        expect(schema.errors.some((error) => error.code === 'STRING_MIN_LENGTH')).to.be.true
    })

    it('should validate string pattern correctly', () => {
        const schema = Validator.string().pattern(/^[a-z]+$/)

        expect(schema.validate('test')).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate('test123')).to.be.false
        expect(schema.errors.some((error) => error.code === 'STRING_PATTERN_MISMATCH')).to.be.true
    })

    it('should validate inverted string pattern correctly', () => {
        const schema = Validator.string().pattern(/^[a-z]+$/, { invert: true })

        expect(schema.validate('test123')).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate('test')).to.be.false
        expect(schema.errors.some((error) => error.code === 'STRING_PATTERN_MISMATCH')).to.be.true
    })

    it('should skip pattern validation for null when nullable is allowed', () => {
        const schema = Validator.string().nullable().pattern(/^[a-z]+$/)

        expect(schema.validate(null)).to.be.true
        expect(schema.errors).to.be.empty
    })

    it('should reject null with pattern when nullable is not allowed', () => {
        const schema = Validator.string().pattern(/^[a-z]+$/)

        expect(schema.validate(null)).to.be.false
        expect(schema.errors.some((error) => error.code === 'STRING_TYPE_ERROR')).to.be.true
    })

    it('should not validate non-string values', () => {
        const schema = Validator.string()

        expect(schema.validate(123)).to.be.false
        expect(schema.errors.some((error) => error.code === 'STRING_TYPE_ERROR')).to.be.true
    })

    it('should validate in value', () => {
        const schema = Validator.string().in(['one', 'two'])

        expect(schema.validate('one')).to.be.true

        expect(schema.validate('three')).to.be.false
        expect(schema.errors.some((error) => error.code === 'STRING_IN')).to.be.true
    })

    it('should include field property in STRING_IN error (Bug 4)', () => {
        const schema = Validator.object({ status: Validator.string().in(['active', 'inactive']) })

        const result = schema.validate({ status: 'invalid' })
        expect(result).to.be.false

        const inError = schema.errors.find((e) => e.code === 'STRING_IN')
        expect(inError).to.exist
        expect(inError).to.have.property('field', 'status')
    })

    it('should include field:null in standalone STRING_IN error', () => {
        const schema = Validator.string().in(['one', 'two'])

        expect(schema.validate('three')).to.be.false
        const inError = schema.errors.find((e) => e.code === 'STRING_IN')
        expect(inError).to.exist
        expect(inError).to.have.property('field', null)
    })

    it('should validate string custom validator correctly', () => {
        const schema = Validator.string().fn((value, errors) => {
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
        const schema = Validator.string().fn(() => {
            throw Error()
        })
        expect(schema.validate('123')).to.be.false
        expect(schema.errors.some((error) => error.code === 'STRING_CUSTOM_VALIDATION')).to.be.true
    })

    it('should validate IPv4 correctly', () => {
        const schema = Validator.string().ip({ v4: true, v6: false })

        expect(schema.validate('192.168.1.1')).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate('255.255.255.255')).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate('::1')).to.be.false
        expect(schema.errors.some((error) => error.code === 'STRING_IP_FORMAT')).to.be.true

        expect(schema.validate('invalid-ip')).to.be.false
        expect(schema.errors.some((error) => error.code === 'STRING_IP_FORMAT')).to.be.true
    })

    it('should validate IPv6 full address correctly', () => {
        const schema = Validator.string().ip({ v4: false, v6: true })

        expect(schema.validate('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate('192.168.1.1')).to.be.false
        expect(schema.errors.some((error) => error.code === 'STRING_IP_FORMAT')).to.be.true

        expect(schema.validate('invalid-ip')).to.be.false
        expect(schema.errors.some((error) => error.code === 'STRING_IP_FORMAT')).to.be.true
    })

    it('should validate compressed IPv6 notation (Bug 1)', () => {
        const schema = Validator.string().ip({ v4: false, v6: true })

        expect(schema.validate('::1')).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate('::')).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate('2001:db8::1')).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate('fe80::1')).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate('2001:db8::')).to.be.true
        expect(schema.errors).to.be.empty
    })

    it('should validate IPv4 or IPv6 correctly', () => {
        const schema = Validator.string().ip({ v4: true, v6: true })

        expect(schema.validate('192.168.1.1')).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate('::1')).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate('invalid-ip')).to.be.false
        expect(schema.errors.some((error) => error.code === 'STRING_IP_FORMAT')).to.be.true
    })

    it('should accept null if nullable is allowed', () => {
        const schema = Validator.string().nullable()
        expect(schema.validate(null)).to.be.true
        expect(schema.errors).to.be.empty
    })

    it('should reject null if nullable is not allowed', () => {
        const schema = Validator.string()
        expect(schema.validate(null)).to.be.false
        expect(schema.errors.some((e) => e.code === 'STRING_TYPE_ERROR')).to.be.true
    })

    it('should pass for undefined when not required', () => {
        const schema = Validator.string()
        expect(schema.validate(undefined)).to.be.true
        expect(schema.errors).to.be.empty
    })

    it('should validate email pattern via pattern()', () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const schema = Validator.string().pattern(emailRegex)

        expect(schema.validate('user@example.com')).to.be.true
        expect(schema.validate('not-an-email')).to.be.false
        expect(schema.errors.some((e) => e.code === 'STRING_PATTERN_MISMATCH')).to.be.true
    })
})
