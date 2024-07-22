import IMV from '../src/index.js'

const object = {
    password: 'opskjgnsodfgjiopdsfj',
    day: 1,
    month: 10,
    year: 1993,
}
const schema = IMV.object({
    password: IMV.string().required().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    day: IMV.number().required().min(1).max(31),
    month: IMV.number().required().min(1).max(12),
    year: IMV.number().required().min(1900).max(2024),
})
const result = schema.validate(object)

console.log(result, schema.errors)
