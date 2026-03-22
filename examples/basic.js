// examples/basic.js
import Validator from '../src/index.js'

const schema = Validator.object({
    name: Validator.string().min(2).max(50),
    age: Validator.number().min(0).max(150),
    email: Validator.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    active: Validator.boolean(),
})

const valid = schema.validate({ name: 'Alice', age: 30, email: 'alice@example.com', active: true })
console.log('Valid result:', valid)
console.log('Errors:', schema.errors)

const invalid = schema.validate({ name: 'A', age: -1, email: 'not-an-email', active: 'yes' })
console.log('Invalid result:', invalid)
console.log('Errors:', schema.errors)
