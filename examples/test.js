import IMV from '../src/index.js'

const object = {
    password: 'opskjgnsodfgjiopdsfj',
}
const schema = IMV.object({
    password: IMV.string().required().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
})
const result = schema.validate(object)

console.log(result, schema.errors)
