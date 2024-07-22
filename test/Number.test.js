import { expect } from 'chai'
import ValidatorNumber from '../src/types/Number.js'

describe('ValidatorNumber', () => {
    let validator

    beforeEach(() => {
        validator = new ValidatorNumber({})
    })

    it('should validate required number correctly', () => {
        validator.required()
        const result = validator.validate(123)
        expect(result).to.be.true
        expect(validator.errors).to.be.empty

        const resultFail = validator.validate(undefined)
        expect(resultFail).to.be.false
        expect(validator.errors).to.include('Value must be type of [object Number]. [object Undefined] given.')
    })

    it('should validate number max limit correctly', () => {
        validator.max(100)
        const result = validator.validate(50)
        expect(result).to.be.true
        expect(validator.errors).to.be.empty

        const resultFail = validator.validate(150)
        expect(resultFail).to.be.false
        expect(validator.errors).to.include('Number must be at most 100.')
    })

    it('should validate number min limit correctly', () => {
        validator.min(10)
        const result = validator.validate(20)
        expect(result).to.be.true
        expect(validator.errors).to.be.empty

        const resultFail = validator.validate(5)
        expect(resultFail).to.be.false
        expect(validator.errors).to.include('Number must be at least 10.')
    })

    it('should validate safe integer when allowUnsafe is false', () => {
        validator = new ValidatorNumber({ allowUnsafe: false })
        const result = validator.validate(9007199254740991)
        expect(result).to.be.true
        expect(validator.errors).to.be.empty

        const resultFail = validator.validate(9007199254740992)
        expect(resultFail).to.be.false
        expect(validator.errors).to.include('Value must be a safe integer.')
    })

    it('should validate NaN when allowNaN is false', () => {
        validator = new ValidatorNumber({ allowNaN: false })
        const resultFail = validator.validate(NaN)
        expect(resultFail).to.be.false
        expect(validator.errors).to.include('NaN is not allowed.')
    })

    it('should allow NaN when allowNaN is true', () => {
        validator = new ValidatorNumber({ allowNaN: true })
        const result = validator.validate(NaN)
        expect(result).to.be.true
        expect(validator.errors).to.be.empty
    })

    it('should validate Infinity when allowInfinity is false', () => {
        validator = new ValidatorNumber({ allowInfinity: false })
        const resultFail = validator.validate(Infinity)
        expect(resultFail).to.be.false
        expect(validator.errors).to.include('Infinity and -Infinity are not allowed.')

        const resultFailNeg = validator.validate(-Infinity)
        expect(resultFailNeg).to.be.false
        expect(validator.errors).to.include('Infinity and -Infinity are not allowed.')
    })

    it('should allow Infinity when allowInfinity is true', () => {
        validator = new ValidatorNumber({ allowInfinity: true })
        const result = validator.validate(Infinity)
        expect(result).to.be.true
        expect(validator.errors).to.be.empty

        const resultNeg = validator.validate(-Infinity)
        expect(resultNeg).to.be.true
        expect(validator.errors).to.be.empty
    })

    it('should handle non-number values when required', () => {
        const resultFail = validator.validate('123')
        expect(resultFail).to.be.false
        expect(validator.errors).to.include('Value must be type of [object Number]. [object String] given.')
    })

    it('should handle optional numbers correctly', () => {
        const validatorNumber = new ValidatorNumber({})
        const result = validatorNumber.validate(undefined)
        expect(result).to.be.true
        expect(validatorNumber.errors).to.be.empty
    })
})
