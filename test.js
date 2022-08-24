const Validator = require('./index')

const validator = new Validator()

validator
    .field('name').required().string({ minLength: 10, maxLength: 20})
    .field('count').integer({ minValue: 5, maxValue: 10 })
    .field('type').in(['TYPE_ONE', 'TYPE_TWO'])
    .field('boolean').boolean()
    .field('array').array({ maxLength: 4 })

let result = validator.validate({
    name: '1234',
    count: null,
    type: 'TYPE_ONE',
    boolean: 0,
    array: [1,2,3,4,5]
})
console.log(result)