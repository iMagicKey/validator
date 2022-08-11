const Validator = require('./index')

const validator = new Validator()

validator
    .field('name').required().string({ minLength: 10, maxLength: 20})
    .field('count').integer({ minValue: 5, maxValue: 10 })
    .field('type').in(['TYPE_ONE', 'TYPE_TWO'])

let result = validator.validate({
    name: '1234',
    count: null,
    type: 'TYPE_ONE'
})

console.log(result)