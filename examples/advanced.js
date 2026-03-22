// examples/advanced.js - IP validation, array validation, date validation, nested objects
import Validator from '../src/index.js'

// IP address validation
const ipSchema = Validator.object({
    ipv4: Validator.string().ip({ v4: true, v6: false }),
    ipv6: Validator.string().ip({ v4: false, v6: true }),
    anyIp: Validator.string().ip(),
})

const ipResult = ipSchema.validate({
    ipv4: '192.168.1.1',
    ipv6: '::1',
    anyIp: '2001:db8::1',
})
console.log('IP validation result:', ipResult)
console.log('IP errors:', ipSchema.errors)

// Array validation with nested item validators
const arraySchema = Validator.object({
    tags: Validator.array(Validator.string().min(1).max(20)).min(1).max(10).unique(),
    scores: Validator.array(Validator.number().min(0).max(100)).required(),
})

const arrayResult = arraySchema.validate({
    tags: ['javascript', 'nodejs', 'esm'],
    scores: [95, 87, 72],
})
console.log('Array validation result:', arrayResult)
console.log('Array errors:', arraySchema.errors)

// Date validation with constraints
const eventSchema = Validator.object({
    startDate: Validator.date().min(new Date('2020-01-01')).required(),
    endDate: Validator.date().max(new Date('2030-12-31')).required(),
    createdAt: Validator.date().nullable(),
})

const dateResult = eventSchema.validate({
    startDate: new Date('2024-03-01'),
    endDate: '2024-12-31',
    createdAt: null,
})
console.log('Date validation result:', dateResult)
console.log('Date errors:', eventSchema.errors)

// Nested objects
const userSchema = Validator.object({
    id: Validator.number().min(1).required(),
    profile: Validator.object({
        firstName: Validator.string().min(1).max(50).required(),
        lastName: Validator.string().min(1).max(50).required(),
        age: Validator.number().min(0).max(150).nullable(),
    }).required(),
    roles: Validator.array(Validator.string().in(['admin', 'user', 'moderator'])).min(1).required(),
    metadata: Validator.object().nullable(),
})

const userResult = userSchema.validate({
    id: 42,
    profile: {
        firstName: 'Jane',
        lastName: 'Doe',
        age: null,
    },
    roles: ['admin', 'user'],
    metadata: null,
})
console.log('User validation result:', userResult)
console.log('User errors:', userSchema.errors)

// Invalid nested example
const invalidUserResult = userSchema.validate({
    id: 0,
    profile: {
        firstName: '',
        lastName: 'Doe',
        age: 200,
    },
    roles: ['superadmin'],
    metadata: null,
})
console.log('Invalid user result:', invalidUserResult)
console.log('Invalid user errors:', userSchema.errors)
