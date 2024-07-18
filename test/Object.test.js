import { expect } from 'chai'
import ValidatorObject from '../src/types/Object.js'

describe('ValidatorObject', () => {
    let validator

    beforeEach(() => {
        validator = new ValidatorObject()
    })

    it('should validate object length correctly', () => {
        validator.length(3)
        const result = validator.validate({ a: 1, b: 2, c: 3 })
        expect(result).to.be.true
        expect(validator.errors._self).to.be.empty

        const resultFail = validator.validate({ a: 1, b: 2 })
        expect(resultFail).to.be.false
        expect(validator.errors._self).to.include('Object must have exactly 3 keys, 2 given.')
    })

    it('should validate object max keys correctly', () => {
        validator.max(2)
        const result = validator.validate({ a: 1, b: 2 })
        expect(result).to.be.true
        expect(validator.errors._self).to.be.empty

        const resultFail = validator.validate({ a: 1, b: 2, c: 3 })
        expect(resultFail).to.be.false
        expect(validator.errors._self).to.include('Object must have at most 2 keys, 3 given.')
    })

    it('should validate object min keys correctly', () => {
        validator.min(2)
        const result = validator.validate({ a: 1, b: 2 })
        expect(result).to.be.true
        expect(validator.errors._self).to.be.empty

        const resultFail = validator.validate({ a: 1 })
        expect(resultFail).to.be.false
        expect(validator.errors._self).to.include('Object must have at least 2 keys, 1 given.')
    })

    it('should validate nested fields correctly', () => {
        const nestedValidator = new ValidatorObject().length(2)
        validator = new ValidatorObject({ nested: nestedValidator })

        const result = validator.validate({ nested: { a: 1, b: 2 } })
        expect(result).to.be.true
        expect(validator.errors._self).to.be.empty

        const resultFail = validator.validate({ nested: { a: 1 } })
        expect(resultFail).to.be.false
        expect(validator.errors).to.have.property('nested')
        expect(validator.errors.nested._self).to.include('Object must have exactly 2 keys, 1 given.')
    })

    it('should validate non-object values correctly', () => {
        const result = validator.validate('string')
        expect(result).to.be.false
        expect(validator.errors._self).to.include('Value must be type of [object Object]. [object String] given.')

        const resultNull = validator.validate(null)
        expect(resultNull).to.be.false
        expect(validator.errors._self).to.include('Value must be type of [object Object]. [object Null] given.')
    })
})
