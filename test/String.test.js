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

    it('should validate in value', () => {
        const schema = IMV.string().in(['one', 'two'])

        expect(schema.validate('one')).to.be.true

        expect(schema.validate('three')).to.be.false
        expect(schema.errors.some((error) => error.code === 'STRING_IN')).to.be.true
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

    it('should validate IPv4 correctly', () => {
        const schema = IMV.string().ip({ v4: true, v6: false })

        expect(schema.validate('192.168.1.1')).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate('255.255.255.255')).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate('::1')).to.be.false
        expect(schema.errors.some((error) => error.code === 'STRING_IP_FORMAT')).to.be.true

        expect(schema.validate('invalid-ip')).to.be.false
        expect(schema.errors.some((error) => error.code === 'STRING_IP_FORMAT')).to.be.true
    })

    it('should validate IPv6 correctly', () => {
        const schema = IMV.string().ip({ v4: false, v6: true })
        expect(schema.validate('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate('192.168.1.1')).to.be.false
        expect(schema.errors.some((error) => error.code === 'STRING_IP_FORMAT')).to.be.true

        expect(schema.validate('invalid-ip')).to.be.false
        expect(schema.errors.some((error) => error.code === 'STRING_IP_FORMAT')).to.be.true
    })

    it('should validate IPv4 or IPv6 correctly', () => {
        const schema = IMV.string().ip({ v4: true, v6: true })

        expect(schema.validate('192.168.1.1')).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate('invalid-ip')).to.be.false
        expect(schema.errors.some((error) => error.code === 'STRING_IP_FORMAT')).to.be.true
    })

    it('should accept null if nullable is allowed', () => {
        const schema = IMV.string().nullable()
        expect(schema.validate(null)).to.be.true
        expect(schema.errors).to.be.empty
    })

    it('should reject null if nullable is not allowed', () => {
        const schema = IMV.string()
        expect(schema.validate(null)).to.be.false
        expect(schema.errors.some((e) => e.code === 'STRING_TYPE_ERROR')).to.be.true
    })
})
