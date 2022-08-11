const Validator = require('./index')

const validator = new Validator()

validator
    .field('name').required()
    .field('count').integer()
    .field('type').in(['TYPE_ONE', 'TYPE_TWO'])

let result = validator.validate({
    name: '12312',
    count: '123',
    type: 'TYPE_ONE'
})

console.log(result)