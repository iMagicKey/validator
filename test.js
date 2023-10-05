import Validator from './index.mjs'

const validator = Validator.init()
    .field('name').required()
    .field('count').integer({ minValue: 5, maxValue: 10 })
    .field('type').in(['TYPE_ONE', 'TYPE_TWO'])
    .field('boolean').boolean()
    .field('array').array({ maxLength: 4 })

const object = {
    name: '1234',
    count: null,
    type: 'TYPE_ONE',
    boolean: 0,
    array: [1,2,3,4,5]
}

if (validator.validate(object)) {
    console.log('OK')
} else {
    console.log(validator.errors)
}
