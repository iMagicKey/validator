const Validator = require('./index')

const validator = new Validator()

validator
    .field('name').isRequired()
    .field('count').isInteger()
    .field('type').isIn(['TYPE_ONE', 'TYPE_TWO'])

let result = validator.validate({
    name: '12312',
    count: '123',
    type: 'TYPE_ONE'
})

console.log(result)