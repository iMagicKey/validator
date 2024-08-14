# imagic-validator

`imagic-validator` is a simple yet powerful JavaScript validation library. It provides an easy-to-use API for validating various data types, including strings, numbers, arrays, and objects.

## Installation

You can install `imagic-validator` via npm:

```bash
npm install imagic-validator
```

## Usage

### Importing the Library

```js
import IMV from 'imagic-validator'
```

### String Validation

```js
const schema = IMV.string().required().min(5).max(10).pattern(/^[a-zA-Z]+$/)

console.log(schema.validate('Hello')) // true
console.log(schema.errors) // []

console.log(schema.validate('Hi')) // false
console.log(schema.errors) // [ { field: null, code: 'STRING_MIN_LENGTH', message: 'Value must have at least 5 characters, 2 given.' } ]

console.log(schema.validate('HelloWorld!')) // false
console.log(schema.errors) // [ { field: null, code: 'STRING_MAX_LENGTH', message: 'Value must have at most 10 characters, 11 given.' } ]

console.log(schema.validate('Hello123')) // false
console.log(schema.errors) // [ { field: null, code: 'STRING_PATTERN_MISMATCH', message: 'Value fails to match the specified pattern "/^[a-zA-Z]+$/".' } ]
```

### Number Validation

```js
const schema = IMV.number().required().min(10).max(100)

console.log(schema.validate(50)) // true
console.log(schema.errors) // []

console.log(schema.validate(5)) // false
console.log(schema.errors) // [ { field: null, code: 'NUMBER_MIN', message: 'Number must be at least 10.' } ]

console.log(schema.validate(150)) // false
console.log(schema.errors) // [ { field: null, code: 'NUMBER_MAX', message: 'Number must be at most 100.' } ]
```

### Array Validation

```js
const schema = IMV.array().min(2).max(5).unique()

console.log(schema.validate([1, 2, 3])) // true
console.log(schema.errors) // []

console.log(schema.validate([1])) // false
console.log(schema.errors) // [ { field: null, code: 'ARRAY_MIN_LENGTH', message: 'Array must have at least 2 elements, 1 given.' } ]

console.log(schema.validate([1, 2, 2])) // false
console.log(schema.errors) // [ { field: null, code: 'ARRAY_UNIQUE', message: 'Array elements must be unique.' } ]
```

### Object Validation

```js
const schema = IMV.object({
    name: IMV.string().required(),
    age: IMV.number().min(18)
}).length(2)

console.log(schema.validate({ name: 'John', age: 30 })) // true
console.log(schema.errors) // []

console.log(schema.validate({ name: 'John' })) // false
console.log(schema.errors) // [ { field: null, code: 'OBJECT_KEYS_LENGTH', message: 'Object must have exactly 2 keys, 1 given.' } ]
```

## Tests

The library uses Mocha and Chai for testing. To run the tests, use the following command:

```bash
npm test
```

Tests cover the core validation features for strings, numbers, arrays, and objects.

## Documentation

Full documentation and usage examples are available on [GitHub](https://github.com/iMagicKey/validator#readme).

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Contributing

If you have ideas for improvements, please open a pull request or create an issue in the [GitHub repository](https://github.com/iMagicKey/validator/issues).
