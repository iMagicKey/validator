import { expect } from 'chai'
import ValidatorString from '../src/types/String.js'

describe('ValidatorString', () => {
    let validator

    beforeEach(() => {
        validator = new ValidatorString()
    })

    it('should validate required string correctly', () => {
        validator.required()
        const result = validator.validate('test')
        expect(result).to.be.true
        expect(validator.errors).to.be.empty

        const resultFail = validator.validate(undefined)
        expect(resultFail).to.be.false
        expect(validator.errors).to.include('Value must be type of [object String]. [object Undefined] given.')
    })

    it('should validate string length correctly', () => {
        validator.length(4)
        const result = validator.validate('test')
        expect(result).to.be.true
        expect(validator.errors).to.be.empty

        const resultFail = validator.validate('testing')
        expect(resultFail).to.be.false
        expect(validator.errors).to.include('Value must have a length of 4 characters, 7 given.')
    })

    it('should validate string max length correctly', () => {
        validator.max(4)
        const result = validator.validate('test')
        expect(result).to.be.true
        expect(validator.errors).to.be.empty

        const resultFail = validator.validate('testing')
        expect(resultFail).to.be.false
        expect(validator.errors).to.include('Value must have at most 4 characters, 7 given.')
    })

    it('should validate string min length correctly', () => {
        validator.min(4)
        const result = validator.validate('test')
        expect(result).to.be.true
        expect(validator.errors).to.be.empty

        const resultFail = validator.validate('tes')
        expect(resultFail).to.be.false
        expect(validator.errors).to.include('Value must have at least 4 characters, 3 given.')
    })

    it('should validate string pattern correctly', () => {
        validator.pattern(/^[a-z]+$/)
        const result = validator.validate('test')
        expect(result).to.be.true
        expect(validator.errors).to.be.empty

        const resultFail = validator.validate('test123')
        expect(resultFail).to.be.false
        expect(validator.errors).to.include('Value fails to match the specified pattern "/^[a-z]+$/".')
    })

    it('should validate inverted string pattern correctly', () => {
        validator.pattern(/^[a-z]+$/, { invert: true })
        const result = validator.validate('test123')
        expect(result).to.be.true
        expect(validator.errors).to.be.empty

        const resultFail = validator.validate('test')
        expect(resultFail).to.be.false
        expect(validator.errors).to.include('Value fails to match the specified pattern "/^[a-z]+$/".')
    })

    it('should not validate non-string values', () => {
        const result = validator.validate(123)
        expect(result).to.be.false
        expect(validator.errors).to.include('Value must be type of [object String]. [object Number] given.')
    })
})
