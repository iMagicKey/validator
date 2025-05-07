import { expect } from 'chai'
import IMV from '../src/index.js'

describe('Date', () => {
    it('should accept valid Date object', () => {
        const schema = IMV.date()
        expect(schema.validate(new Date())).to.be.true
        expect(schema.errors).to.be.empty
    })

    it('should accept valid ISO 8601 string', () => {
        const schema = IMV.date()
        expect(schema.validate('2025-05-07T12:43:11.249+00:00')).to.be.true
        expect(schema.errors).to.be.empty
    })

    it('should accept unix timestamp if number is true', () => {
        const schema = IMV.date({ number: true })
        expect(schema.validate(1683456000000)).to.be.true
        expect(schema.errors).to.be.empty
    })

    it('should reject unix timestamp if number is false', () => {
        const schema = IMV.date({ number: false })
        expect(schema.validate(1683456000000)).to.be.false
        expect(schema.errors.some((e) => e.code === 'DATE_TYPE_ERROR')).to.be.true
    })

    it('should accept null if nullable is allowed', () => {
        const schema = IMV.date().nullable()
        expect(schema.validate(null)).to.be.true
        expect(schema.errors).to.be.empty
    })

    it('should reject null if nullable is not allowed', () => {
        const schema = IMV.date()
        expect(schema.validate(null)).to.be.false
        expect(schema.errors.some((e) => e.code === 'DATE_TYPE_ERROR')).to.be.true
    })

    it('should reject invalid date string', () => {
        const schema = IMV.date()
        expect(schema.validate('not-a-date')).to.be.false
        expect(schema.errors.some((e) => e.code === 'DATE_TYPE_ERROR')).to.be.true
    })

    it('should reject invalid type (object)', () => {
        const schema = IMV.date()
        expect(schema.validate({})).to.be.false
        expect(schema.errors.some((e) => e.code === 'DATE_TYPE_ERROR')).to.be.true
    })

    it('should validate .required()', () => {
        const schema = IMV.date().required()
        expect(schema.validate(undefined)).to.be.false
        expect(schema.errors.some((e) => e.code === 'DATE_TYPE_ERROR')).to.be.true
    })

    it('should pass if not required and value is undefined', () => {
        const schema = IMV.date()
        expect(schema.validate(undefined)).to.be.true
        expect(schema.errors).to.be.empty
    })

    it('should validate .min() constraint', () => {
        const schema = IMV.date().min(new Date('2024-01-01'))
        expect(schema.validate(new Date('2024-06-01'))).to.be.true
        expect(schema.validate(new Date('2023-12-31'))).to.be.false
        expect(schema.errors.some((e) => e.code === 'DATE_MIN')).to.be.true
    })

    it('should validate .max() constraint', () => {
        const schema = IMV.date().max(new Date('2025-12-31'))
        expect(schema.validate(new Date('2025-01-01'))).to.be.true
        expect(schema.validate(new Date('2026-01-01'))).to.be.false
        expect(schema.errors.some((e) => e.code === 'DATE_MAX')).to.be.true
    })

    it('should support .fn() custom rule', () => {
        const schema = IMV.date().fn((value, errors) => {
            if (value.getFullYear() < 2020) {
                errors.push({ code: 'YEAR_TOO_OLD', message: 'Year must be >= 2020' })
            }
        })

        expect(schema.validate(new Date('2021-01-01'))).to.be.true
        expect(schema.validate(new Date('2010-01-01'))).to.be.false
        expect(schema.errors.some((e) => e.code === 'YEAR_TOO_OLD')).to.be.true
    })

    it('should handle errors in .fn()', () => {
        const schema = IMV.date().fn(() => {
            throw new Error('oops')
        })
        expect(schema.validate(new Date())).to.be.false
        expect(schema.errors.some((e) => e.code === 'DATE_CUSTOM_VALIDATION')).to.be.true
    })
})
