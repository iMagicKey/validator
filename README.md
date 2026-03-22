# imagic-validator

> Validate strings, numbers, arrays, objects, booleans, and dates with a chainable schema builder.

## Install

```bash
npm install imagic-validator
```

## Quick Start

```js
import Validator from 'imagic-validator'

const schema = Validator.object({
    username: Validator.string().required().min(3).max(32),
    age:      Validator.number().required().min(18),
    email:    Validator.string().required().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
})

const ok = schema.validate({ username: 'alice', age: 25, email: 'alice@example.com' })
console.log(ok)           // true
console.log(schema.errors) // []

const fail = schema.validate({ username: 'al', age: 15 })
console.log(fail)           // false
console.log(schema.errors)
// [
//   { field: 'username', code: 'STRING_MIN_LENGTH', message: '...' },
//   { field: 'age',      code: 'NUMBER_MIN',        message: '...' },
//   { field: 'email',    code: 'STRING_TYPE_ERROR',  message: '...' },
// ]
```

## API

### `Validator` (static factory)

All validator types are created via static methods on the `Validator` class:

```ts
import Validator from 'imagic-validator'

Validator.string(options?)   → ValidatorString
Validator.number(options?)   → ValidatorNumber
Validator.array(itemValidator?) → ValidatorArray
Validator.object(fields)     → ValidatorObject
Validator.boolean(options?)  → ValidatorBoolean
Validator.date(options?)     → ValidatorDate
```

---

### Shared interface — all validator types

Every validator type exposes these methods:

#### `.required(): this`

Marks the field as required. When the value is `undefined`, a type error is added. Without `.required()`, `undefined` passes silently.

#### `.nullable(): this`

Allows `null` as a valid value. When `null` is passed and `.nullable()` is set, validation passes immediately (no rules are checked). Not available on `ValidatorBoolean`.

#### `.fn(rule: (value, errors) => void): this`

Adds a custom rule function. Receives the current value and the errors array. Push error objects manually or throw — thrown errors are caught and converted to a custom validation error.

```js
Validator.string().fn((value, errors) => {
    if (value.includes('banned')) {
        errors.push({ field: null, code: 'BANNED_WORD', message: 'Contains banned word.' })
    }
})
```

#### `.validate(value): boolean`

Runs all rules against `value`. Clears and repopulates `.errors`. Returns `true` when there are no errors.

#### `.errors: Array<{ field: string | null, code: string, message: string }>`

Array of validation errors from the last `.validate()` call. Each object:

| Key | Type | Description |
|-----|------|-------------|
| `field` | `string \| null` | Field path (nested fields use dot notation: `'address.zip'`). `null` at the top level. |
| `code` | `string` | Machine-readable error code (see full list below) |
| `message` | `string` | Human-readable description |

---

### `Validator.string()` → `ValidatorString`

Validates that a value is a `string`.

```js
Validator.string()
    .required()
    .nullable()
    .min(n)             // minimum character count
    .max(n)             // maximum character count
    .length(n)          // exact character count
    .in(['a', 'b'])     // value must be one of the listed strings
    .pattern(regex, { invert?: boolean })  // must match (or not match when invert: true)
    .ip({ v4?: boolean, v6?: boolean })    // must be a valid IP address
    .fn(rule)
```

**`.pattern(pattern, options?)`**

- `pattern` — `RegExp` or a string (converted to `RegExp`)
- `options.invert` — when `true`, the value must **not** match the pattern
- Skips the check when value is `null` (nullable) or `undefined`

**`.ip(options?)`**

- `{ v4: true, v6: true }` — default; accepts either IPv4 or IPv6
- `{ v4: true, v6: false }` — IPv4 only
- `{ v4: false, v6: true }` — IPv6 only
- Supports compressed IPv6 (`::1`, `fe80::1`, etc.)

---

### `Validator.number(options?)` → `ValidatorNumber`

Validates that a value is a JavaScript `number`.

```ts
Validator.number({
    allowNaN?:      boolean  // default: false
    allowInfinity?: boolean  // default: false
    allowUnsafe?:   boolean  // default: true
})
```

`allowNaN`, `allowInfinity`, and `allowUnsafe` rules are evaluated on every `.validate()` call regardless of other rules.

```js
Validator.number()
    .required()
    .nullable()
    .min(n)
    .max(n)
    .in([1, 2, 3])
    .fn(rule)
```

---

### `Validator.array(itemValidator?)` → `ValidatorArray`

Validates that a value is an `Array`. Optionally validates each element with another validator.

```js
// Basic
Validator.array()
    .required()
    .nullable()
    .min(n)       // minimum element count
    .max(n)       // maximum element count
    .length(n)    // exact element count
    .unique()     // all elements must be strictly unique (uses Set)
    .in([...])    // every element must be in this list
    .fn(rule)

// With per-element validation
const schema = Validator.array(Validator.string().min(1))
schema.validate(['hello', 'world'])  // true
schema.validate(['hello', 42])       // false — errors[0].field = '[1]'
```

When an `itemValidator` is provided, errors from element validation are added with `field` set to `[index]` or `[index].nested.path`.

---

### `Validator.object(fields)` → `ValidatorObject`

Validates that a value is a plain object and validates each declared field.

```js
const schema = Validator.object({
    name: Validator.string().required(),
    age:  Validator.number().min(0),
})
    .required()
    .nullable()
    .strict()      // reject keys not declared in fields
    .min(n)        // minimum key count
    .max(n)        // maximum key count
    .length(n)     // exact key count
    .fn(rule)
```

**`.strict()`** — Extra keys not listed in `fields` cause an `OBJECT_EXTRA_KEYS` error.

Field errors are prefixed with the field name. Nested object errors use dot notation: `'address.zip'`.

---

### `Validator.boolean(options?)` → `ValidatorBoolean`

Validates boolean values.

```ts
Validator.boolean({
    strict?: boolean  // default: true
})
```

- `strict: true` — only `true` / `false` are accepted
- `strict: false` — also accepts `0`, `1`, `"true"`, `"false"` (case-insensitive)

```js
Validator.boolean()
    .required()
    .isTrue()   // value must resolve to true
    .isFalse()  // value must resolve to false
    .fn(rule)
```

Note: `ValidatorBoolean` does not support `.nullable()`.

---

### `Validator.date(options?)` → `ValidatorDate`

Validates date values.

```ts
Validator.date({
    string?: boolean  // default: true  — accept ISO date strings
    number?: boolean  // default: true  — accept Unix timestamps (ms)
})
```

Accepted input types (all converted to `Date` internally):
- `Date` object — always accepted
- `string` — when `string: true` (must be parseable by `new Date(string)`)
- `number` — when `number: true` (millisecond timestamp)

```js
Validator.date()
    .required()
    .nullable()
    .min(date)   // date must be >= this date (Date | string | number)
    .max(date)   // date must be <= this date (Date | string | number)
    .fn(rule)
```

Invalid date values (e.g. `new Date('invalid')`) produce `DATE_TYPE_ERROR`.

---

## Error Handling

Validators never throw during `.validate()`. All problems are represented as error objects in `.errors[]`.

Custom rules added via `.fn()` may throw — thrown errors are caught and converted to a custom validation error (e.g. `STRING_CUSTOM_VALIDATION`).

## Error Code Reference

**String**

| Code | Cause |
|------|-------|
| `STRING_TYPE_ERROR` | Value is not a string |
| `STRING_LENGTH` | `.length(n)` — exact length mismatch |
| `STRING_MIN_LENGTH` | `.min(n)` — too short |
| `STRING_MAX_LENGTH` | `.max(n)` — too long |
| `STRING_IN` | `.in([...])` — value not in allowed list |
| `STRING_PATTERN_MISMATCH` | `.pattern()` — regex mismatch |
| `STRING_IP_FORMAT` | `.ip()` — not a valid IP address |
| `STRING_CUSTOM_VALIDATION` | `.fn()` — custom rule pushed error or threw |

**Number**

| Code | Cause |
|------|-------|
| `NUMBER_TYPE_ERROR` | Value is not a number |
| `NUMBER_MIN` | `.min(n)` — value too small |
| `NUMBER_MAX` | `.max(n)` — value too large |
| `NUMBER_IN` | `.in([...])` — value not in allowed list |
| `NUMBER_NAN_NOT_ALLOWED` | `NaN` and `allowNaN: false` |
| `NUMBER_INFINITY_NOT_ALLOWED` | `±Infinity` and `allowInfinity: false` |
| `NUMBER_UNSAFE` | Not a safe integer and `allowUnsafe: false` |
| `NUMBER_CUSTOM_VALIDATION` | `.fn()` — custom rule pushed error or threw |

**Array**

| Code | Cause |
|------|-------|
| `ARRAY_TYPE_ERROR` | Value is not an array |
| `ARRAY_MIN_LENGTH` | `.min(n)` — too few elements |
| `ARRAY_MAX_LENGTH` | `.max(n)` — too many elements |
| `ARRAY_EXACT_LENGTH` | `.length(n)` — element count mismatch |
| `ARRAY_UNIQUE` | `.unique()` — duplicate elements |
| `ARRAY_IN` | `.in([...])` — element not in allowed list |
| `ARRAY_CUSTOM_VALIDATION` | `.fn()` — custom rule pushed error or threw |

**Object**

| Code | Cause |
|------|-------|
| `OBJECT_TYPE_ERROR` | Value is not a plain object |
| `OBJECT_KEYS_MIN` | `.min(n)` — too few keys |
| `OBJECT_KEYS_MAX` | `.max(n)` — too many keys |
| `OBJECT_KEYS_LENGTH` | `.length(n)` — key count mismatch |
| `OBJECT_EXTRA_KEYS` | `.strict()` — unknown keys present |
| `OBJECT_CUSTOM_VALIDATION` | `.fn()` — custom rule pushed error or threw |

**Boolean**

| Code | Cause |
|------|-------|
| `BOOLEAN_TYPE_ERROR` | Value is not a valid boolean (or coercible when `strict: false`) |
| `BOOLEAN_NOT_TRUE` | `.isTrue()` — value is not `true` |
| `BOOLEAN_NOT_FALSE` | `.isFalse()` — value is not `false` |
| `BOOLEAN_CUSTOM_VALIDATION` | `.fn()` — custom rule pushed error or threw |

**Date**

| Code | Cause |
|------|-------|
| `DATE_TYPE_ERROR` | Value is not a valid date / unsupported type |
| `DATE_MIN` | `.min(date)` — date is too early |
| `DATE_MAX` | `.max(date)` — date is too late |
| `DATE_CUSTOM_VALIDATION` | `.fn()` — custom rule pushed error or threw |

## Examples

See [`examples/`](examples/) for runnable scripts.

```js
// Object with nested validators
const addressSchema = Validator.object({
    street: Validator.string().required(),
    zip:    Validator.string().required().pattern(/^\d{5}$/),
    city:   Validator.string().required(),
}).required().strict()

const userSchema = Validator.object({
    name:    Validator.string().required().min(1).max(100),
    age:     Validator.number().required().min(0).max(150),
    address: addressSchema,
    roles:   Validator.array(Validator.string().in(['admin', 'user', 'guest'])).min(1),
    active:  Validator.boolean().required().isTrue(),
    dob:     Validator.date().max(new Date()),
})

const valid = userSchema.validate({
    name: 'Alice',
    age: 30,
    address: { street: '123 Main St', zip: '90210', city: 'Beverly Hills' },
    roles: ['admin'],
    active: true,
    dob: '1994-06-15',
})

console.log(valid)
console.log(userSchema.errors)
```

## License

MIT
