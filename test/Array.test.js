import { expect } from 'chai'
import IMV from '../src/index.js'

describe('Array', () => {
    // it('should validate required array correctly', () => {
    //     const schema = IMV.array().required()
    //     expect(schema.validate([1, 2, 3])).to.be.true
    //     expect(schema.errors).to.be.empty

    //     expect(schema.validate(undefined)).to.be.false
    //     expect(schema.errors.some((error) => error.code === 'ARRAY_TYPE_ERROR')).to.be.true
    // })

    // it('should validate unique elements in array correctly', () => {
    //     const schema = IMV.array().unique()

    //     expect(schema.validate([1, 2, 3])).to.be.true
    //     expect(schema.errors).to.be.empty

    //     expect(schema.validate([1, 2, 2])).to.be.false
    //     expect(schema.errors.some((error) => error.code === 'ARRAY_UNIQUE')).to.be.true
    // })

    // it('should validate elements in allowed values correctly', () => {
    //     const schema = IMV.array().in([1, 2, 3])

    //     expect(schema.validate([1, 2])).to.be.true
    //     expect(schema.errors).to.be.empty

    //     expect(schema.validate([1, 4])).to.be.false
    //     expect(schema.errors.some((error) => error.code === 'ARRAY_IN')).to.be.true
    // })

    // it('should validate minimum array length correctly', () => {
    //     const schema = IMV.array().min(2)

    //     expect(schema.validate([1, 2])).to.be.true
    //     expect(schema.errors).to.be.empty

    //     expect(schema.validate([1])).to.be.false
    //     expect(schema.errors.some((error) => error.code === 'ARRAY_MIN_LENGTH')).to.be.true
    // })

    // it('should validate maximum array length correctly', () => {
    //     const schema = IMV.array().max(2)

    //     expect(schema.validate([1, 2])).to.be.true
    //     expect(schema.errors).to.be.empty

    //     expect(schema.validate([1, 2, 3])).to.be.false
    //     expect(schema.errors.some((error) => error.code === 'ARRAY_MAX_LENGTH')).to.be.true
    // })

    // it('should validate exact array length correctly', () => {
    //     const schema = IMV.array().length(2)

    //     expect(schema.validate([1, 2])).to.be.true
    //     expect(schema.errors).to.be.empty

    //     expect(schema.validate([1, 2, 3])).to.be.false
    //     expect(schema.errors.some((error) => error.code === 'ARRAY_EXACT_LENGTH')).to.be.true
    // })

    // it('should handle non-array values when required', () => {
    //     const schema = IMV.array().required()

    //     expect(schema.validate('not an array')).to.be.false
    //     expect(schema.errors.some((error) => error.code === 'ARRAY_TYPE_ERROR')).to.be.true
    // })

    // it('should handle optional arrays correctly', () => {
    //     const schema = IMV.array()

    //     expect(schema.validate(undefined)).to.be.true
    //     expect(schema.errors).to.be.empty
    // })

    // it('should validate array custom validator correctly', () => {
    //     const schema = IMV.array().fn((value, errors) => {
    //         if (value.includes(3)) {
    //             errors.push({ field: null, code: 'CUSTOM_ERROR', message: 'Custom message' })
    //         }
    //     })

    //     expect(schema.validate([1, 2])).to.be.true
    //     expect(schema.errors).to.be.empty

    //     expect(schema.validate([1, 2, 3])).to.be.false
    //     expect(schema.errors.some((error) => error.code === 'CUSTOM_ERROR')).to.be.true
    // })

    // it('should validate array custom validator error', () => {
    //     const schema = IMV.array().fn(() => {
    //         throw Error()
    //     })
    //     expect(schema.validate([1, 2, 3])).to.be.false
    //     expect(schema.errors.some((error) => error.code === 'ARRAY_CUSTOM_VALIDATION')).to.be.true
    // })

    // it('should validate nested number items', () => {
    //     const schema = IMV.array(IMV.number().min(5).max(10)).required()

    //     expect(schema.validate([5, 6, 7])).to.be.true
    //     expect(schema.errors).to.be.empty

    //     expect(schema.validate([4, 11])).to.be.false
    //     expect(schema.errors.some((err) => err.code === 'NUMBER_MIN' && err.field === '[0]')).to.be.true
    //     expect(schema.errors.some((err) => err.code === 'NUMBER_MAX' && err.field === '[1]')).to.be.true
    // })

    it('should validate nested string items', () => {
        const schema = IMV.array(IMV.string().min(2).max(5)).required()

        expect(schema.validate(['hi', 'hello'])).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate(['a', 'toolong'])).to.be.false
        expect(schema.errors.some((err) => err.code === 'STRING_MIN_LENGTH' && err.field === '[0]')).to.be.true
        expect(schema.errors.some((err) => err.code === 'STRING_MAX_LENGTH' && err.field === '[1]')).to.be.true
    })

    it('should validate nested object items', () => {
        const schema = IMV.array(
            IMV.object({
                name: IMV.string().required().min(1),
                age: IMV.number().min(18),
            })
        ).required()

        expect(
            schema.validate([
                { name: 'Alice', age: 25 },
                { name: 'Bob', age: 18 },
            ])
        ).to.be.true
        expect(schema.errors).to.be.empty

        expect(schema.validate([{ name: '', age: 17 }, { age: 30 }])).to.be.false

        expect(schema.errors.some((err) => err.code === 'STRING_MIN_LENGTH' && err.field === '[0].name')).to.be.true
        expect(schema.errors.some((err) => err.code === 'NUMBER_MIN' && err.field === '[0].age')).to.be.true
        expect(schema.errors.some((err) => err.code === 'STRING_TYPE_ERROR' && err.field === '[1].name')).to.be.true
    })
})
