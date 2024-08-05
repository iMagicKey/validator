import { expect } from 'chai'
import ValidatorArray from '../src/types/Array.js'

describe('ValidatorArray', () => {
    let validator

    beforeEach(() => {
        validator = new ValidatorArray()
    })

    it('should validate required array correctly', () => {
        validator.required()
        const result = validator.validate([1, 2, 3])
        expect(result).to.be.true
        expect(validator.errors).to.be.empty

        const resultFail = validator.validate(undefined)
        expect(resultFail).to.be.false
        expect(validator.errors).to.include('Value must be type of [object Array]. [object Undefined] given.')
    })

    it('should validate unique elements in array correctly', () => {
        validator.unique()
        const result = validator.validate([1, 2, 3])
        expect(result).to.be.true
        expect(validator.errors).to.be.empty

        const resultFail = validator.validate([1, 2, 2])
        expect(resultFail).to.be.false
        expect(validator.errors).to.include('Array elements must be unique.')
    })

    it('should validate elements in allowed values correctly', () => {
        validator.in([1, 2, 3])
        const result = validator.validate([1, 2])
        expect(result).to.be.true
        expect(validator.errors).to.be.empty

        const resultFail = validator.validate([1, 4])
        expect(resultFail).to.be.false
        expect(validator.errors).to.include('Array elements must be one of [1,2,3]. Invalid values: [4].')
    })

    it('should validate minimum array length correctly', () => {
        validator.min(2)
        const result = validator.validate([1, 2])
        expect(result).to.be.true
        expect(validator.errors).to.be.empty

        const resultFail = validator.validate([1])
        expect(resultFail).to.be.false
        expect(validator.errors).to.include('Array must have at least 2 elements, 1 given.')
    })

    it('should validate maximum array length correctly', () => {
        validator.max(2)
        const result = validator.validate([1, 2])
        expect(result).to.be.true
        expect(validator.errors).to.be.empty

        const resultFail = validator.validate([1, 2, 3])
        expect(resultFail).to.be.false
        expect(validator.errors).to.include('Array must have at most 2 elements, 3 given.')
    })

    it('should validate exact array length correctly', () => {
        validator.length(2)
        const result = validator.validate([1, 2])
        expect(result).to.be.true
        expect(validator.errors).to.be.empty

        const resultFail = validator.validate([1, 2, 3])
        expect(resultFail).to.be.false
        expect(validator.errors).to.include('Array must have exactly 2 elements, 3 given.')
    })

    it('should handle non-array values when required', () => {
        validator.required()
        const resultFail = validator.validate('not an array')
        expect(resultFail).to.be.false
        expect(validator.errors).to.include('Value must be type of [object Array]. [object String] given.')
    })

    it('should handle optional arrays correctly', () => {
        const result = validator.validate(undefined)
        expect(result).to.be.true
        expect(validator.errors).to.be.empty
    })
})
