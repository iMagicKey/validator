import IMV from '../src/index.js'

const object = {
    password: 'opskjgnsodfgjiopdsfj',
    email: 'domain@example.com',
    day: 1,
    month: 10,
    year: 1993,
    slug: 'slug',
}

const schema = IMV.object({
    password: IMV.string().required().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    email: IMV.string().required().pattern(new RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$')),
    day: IMV.number().required().min(1).max(31),
    month: IMV.number().required().min(1).max(12),
    year: IMV.number().required().min(1900).max(2024),
    slug: IMV.string()
        .required()
        .fn((value, errors) => {
            if (value !== 'slug') {
                errors.push('Value not good')
            }
        }),
})

console.log(schema.validate(object), schema.errors)
