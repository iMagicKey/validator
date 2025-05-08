import { expect } from 'chai'
import IMV from '../src/index.js'

describe('Number', () => {
    it('should validate required number correctly', () => {
        const schema = IMV.number().required()

        expect(schema.validate(123)).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate(undefined)).to.be.false
        expect(schema.errors.some((error) => error.code === 'NUMBER_TYPE_ERROR')).to.be.true
    })

    it('should validate number max limit correctly', () => {
        const schema = IMV.number().max(100)

        expect(schema.validate(50)).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate(150)).to.be.false
        expect(schema.errors.some((error) => error.code === 'NUMBER_MAX')).to.be.true
    })

    it('should validate number min limit correctly', () => {
        const schema = IMV.number().min(10)

        expect(schema.validate(20)).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate(5)).to.be.false
        expect(schema.errors.some((error) => error.code === 'NUMBER_MIN')).to.be.true
    })

    it('should validate safe integer when allowUnsafe is false', () => {
        const schema = IMV.number({ allowUnsafe: false })

        expect(schema.validate(9007199254740991)).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate(9007199254740992)).to.be.false
        expect(schema.errors.some((error) => error.code === 'NUMBER_UNSAFE')).to.be.true
    })

    it('should validate NaN when allowNaN is false', () => {
        const schema = IMV.number({ allowNaN: false })

        expect(schema.validate(NaN)).to.be.false
        expect(schema.errors.some((error) => error.code === 'NUMBER_NAN_NOT_ALLOWED')).to.be.true
    })

    it('should allow NaN when allowNaN is true', () => {
        const schema = IMV.number({ allowNaN: true })

        expect(schema.validate(NaN)).to.be.true
        expect(schema.errors).to.be.empty
    })

    it('should validate Infinity when allowInfinity is false', () => {
        const schema = IMV.number({ allowInfinity: false })

        expect(schema.validate(Infinity)).to.be.false
        expect(schema.errors.some((error) => error.code === 'NUMBER_INFINITY_NOT_ALLOWED')).to.be.true

        expect(schema.validate(-Infinity)).to.be.false
        expect(schema.errors.some((error) => error.code === 'NUMBER_INFINITY_NOT_ALLOWED')).to.be.true
    })

    it('should allow Infinity when allowInfinity is true', () => {
        const schema = IMV.number({ allowInfinity: true })

        expect(schema.validate(Infinity)).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate(-Infinity)).to.be.true
        expect(schema.errors).to.be.empty
    })

    it('should handle non-number values when required', () => {
        const schema = IMV.number().required()

        expect(schema.validate('123')).to.be.false
        expect(schema.errors.some((error) => error.code === 'NUMBER_TYPE_ERROR')).to.be.true
    })

    it('should handle optional numbers correctly', () => {
        const schema = IMV.number()

        expect(schema.validate(undefined)).to.be.true
        expect(schema.errors).to.be.empty
    })

    it('should validate in value', () => {
        const schema = IMV.number().in([1, 2])

        expect(schema.validate(1)).to.be.true

        expect(schema.validate(3)).to.be.false
        expect(schema.errors.some((error) => error.code === 'NUMBER_IN')).to.be.true
    })

    it('should accept null if nullable is allowed', () => {
        const schema = IMV.number().nullable()
        expect(schema.validate(null)).to.be.true
        expect(schema.errors).to.be.empty
    })

    it('should reject null if nullable is not allowed', () => {
        const schema = IMV.number()
        expect(schema.validate(null)).to.be.false
        expect(schema.errors.some((e) => e.code === 'NUMBER_TYPE_ERROR')).to.be.true
    })
})
