# AGENT — imagic-validator

## Purpose

Build chainable validation schemas for strings, numbers, arrays, objects, booleans, and dates; collect typed error objects without throwing.

## Package

- npm: `imagic-validator`
- import (local): `import Validator from '../src/index.js'`
- import (installed): `import Validator from 'imagic-validator'`
- zero runtime deps

## Exports

### `default` — `Validator` class

Only a default export. No named exports.

```js
import Validator from 'imagic-validator'
```

All validator types are created via static factory methods on `Validator`.

---

## Static Factory Methods

| Method | Returns |
|--------|---------|
| `Validator.string()` | `ValidatorString` |
| `Validator.number(options?)` | `ValidatorNumber` |
| `Validator.array(itemValidator?)` | `ValidatorArray` |
| `Validator.object(fields)` | `ValidatorObject` |
| `Validator.boolean(options?)` | `ValidatorBoolean` |
| `Validator.date(options?)` | `ValidatorDate` |

---

## Shared Interface (all types)

### `.required(): this`
- `undefined` input → type error added to `.errors`
- Without `.required()`: `undefined` passes silently (returns `true`, no errors)

### `.nullable(): this`
- `null` input → returns `true` immediately, no rules run
- Not available on `ValidatorBoolean`

### `.fn(rule: (value, errors) => void): this`
- Adds a custom rule; push error objects to `errors` array directly, or throw
- Thrown errors caught → custom validation error code added automatically

### `.validate(value): boolean`
- Clears `.errors`, runs all rules, returns `true` when `errors.length === 0`
- Never throws

### `.errors: Array<{ field: string | null, code: string, message: string }>`
- Populated after `.validate()`; empty array on success
- `field`: `null` at scalar validators; dot-path string when inside `ValidatorObject`

---

## ValidatorString

**Constructor:** `Validator.string()` — no options

**Methods (all chainable):**

| Method | Error code | Notes |
|--------|-----------|-------|
| `.min(n)` | `STRING_MIN_LENGTH` | `value.length < n` |
| `.max(n)` | `STRING_MAX_LENGTH` | `value.length > n` |
| `.length(n)` | `STRING_LENGTH` | `value.length !== n` |
| `.in(string[])` | `STRING_IN` | value not in array |
| `.pattern(regex, { invert? })` | `STRING_PATTERN_MISMATCH` | `invert: true` = must NOT match; skips null/undefined |
| `.ip({ v4?, v6? })` | `STRING_IP_FORMAT` | both default `true`; supports compressed IPv6 (`::1`) |
| `.required()` | `STRING_TYPE_ERROR` | — |
| `.nullable()` | — | null passes |
| `.fn(rule)` | `STRING_CUSTOM_VALIDATION` | — |

**Type check:** `Object.prototype.toString.call(value) === '[object String]'`

---

## ValidatorNumber

**Constructor:** `Validator.number({ allowNaN?, allowInfinity?, allowUnsafe? })`

| Option | Default | Notes |
|--------|---------|-------|
| `allowNaN` | `false` | `NaN` triggers `NUMBER_NAN_NOT_ALLOWED` |
| `allowInfinity` | `false` | `±Infinity` triggers `NUMBER_INFINITY_NOT_ALLOWED` |
| `allowUnsafe` | `true` | `false` = requires `Number.isSafeInteger(value)` |

NaN/Infinity/unsafe rules run on every `.validate()` call automatically (applied via `applyGeneralRules()` in constructor).

**Methods (all chainable):**

| Method | Error code | Notes |
|--------|-----------|-------|
| `.min(n)` | `NUMBER_MIN` | `value < n` |
| `.max(n)` | `NUMBER_MAX` | `value > n` |
| `.in(number[])` | `NUMBER_IN` | value not in array |
| `.required()` | `NUMBER_TYPE_ERROR` | — |
| `.nullable()` | — | null passes |
| `.fn(rule)` | `NUMBER_CUSTOM_VALIDATION` | — |

**Type check:** `Object.prototype.toString.call(value) === '[object Number]'`

---

## ValidatorArray

**Constructor:** `Validator.array(itemValidator?)` — `itemValidator` is any validator instance or `null`

**Methods (all chainable):**

| Method | Error code | Notes |
|--------|-----------|-------|
| `.min(n)` | `ARRAY_MIN_LENGTH` | `value.length < n` |
| `.max(n)` | `ARRAY_MAX_LENGTH` | `value.length > n` |
| `.length(n)` | `ARRAY_EXACT_LENGTH` | `value.length !== n` |
| `.unique()` | `ARRAY_UNIQUE` | duplicate check via `Set` |
| `.in(any[])` | `ARRAY_IN` | every element must be in list |
| `.required()` | `ARRAY_TYPE_ERROR` | — |
| `.nullable()` | — | null passes |
| `.fn(rule)` | `ARRAY_CUSTOM_VALIDATION` | — |

**itemValidator behavior:**
- Calls `itemValidator.validate(item)` for each element
- On failure, maps errors to `field: '[index]'` or `'[index].nested.path'`
- Item errors appended to `.errors` after array-level rules

**Type check:** `Object.prototype.toString.call(value) === '[object Array]'`

---

## ValidatorObject

**Constructor:** `Validator.object(fields: Record<string, AnyValidator>)`

**Methods (all chainable):**

| Method | Error code | Notes |
|--------|-----------|-------|
| `.strict()` | `OBJECT_EXTRA_KEYS` | Rejects keys not in `fields` |
| `.min(n)` | `OBJECT_KEYS_MIN` | `Object.keys(value).length < n` |
| `.max(n)` | `OBJECT_KEYS_MAX` | `Object.keys(value).length > n` |
| `.length(n)` | `OBJECT_KEYS_LENGTH` | exact key count |
| `.required()` | `OBJECT_TYPE_ERROR` | — |
| `.nullable()` | — | null passes |
| `.fn(rule)` | `OBJECT_CUSTOM_VALIDATION` | — |

**Field validation:**
- Each declared field in `fields` is validated with its validator
- Field errors have `field` set to the key name; nested paths use dot notation: `'address.zip'`
- Validation continues for all fields even if some fail (collects all errors)

**Type check:** `Object.prototype.toString.call(value) === '[object Object]'`

---

## ValidatorBoolean

**Constructor:** `Validator.boolean({ strict? })`

| Option | Default | Notes |
|--------|---------|-------|
| `strict` | `true` | `false` also accepts `0`, `1`, `"true"`, `"false"` (case-insensitive) |

**Methods (all chainable):**

| Method | Error code | Notes |
|--------|-----------|-------|
| `.isTrue()` | `BOOLEAN_NOT_TRUE` | resolved value must be `true` |
| `.isFalse()` | `BOOLEAN_NOT_FALSE` | resolved value must be `false` |
| `.required()` | `BOOLEAN_TYPE_ERROR` | — |
| `.fn(rule)` | `BOOLEAN_CUSTOM_VALIDATION` | — |

**No `.nullable()` method** — not supported on `ValidatorBoolean`.

**Type resolution (non-strict):**
- `1` → `true`, `0` → `false`
- `"true"` / `"TRUE"` → `true`, `"false"` / `"FALSE"` → `false`
- anything else → `null` (type error)

---

## ValidatorDate

**Constructor:** `Validator.date({ string?, number? })`

| Option | Default | Notes |
|--------|---------|-------|
| `string` | `true` | Accept ISO strings (parsed with `new Date(str)`) |
| `number` | `true` | Accept ms timestamps (wrapped with `new Date(n)`) |

`Date` objects are always accepted regardless of options.

**Methods (all chainable):**

| Method | Error code | Notes |
|--------|-----------|-------|
| `.min(date)` | `DATE_MIN` | `date` — any `Date`, string, or number |
| `.max(date)` | `DATE_MAX` | `date` — any `Date`, string, or number |
| `.required()` | `DATE_TYPE_ERROR` | — |
| `.nullable()` | — | null passes |
| `.fn(rule)` | `DATE_CUSTOM_VALIDATION` | — |

Invalid dates (`new Date('bad')`) produce `DATE_TYPE_ERROR`.

---

## Error Object Shape

```ts
{
    field: string | null,  // null = top-level; 'key' or 'key.nested' inside objects
    code: string,          // one of the codes below
    message: string        // human-readable detail
}
```

**All error codes:**

STRING: `STRING_TYPE_ERROR`, `STRING_LENGTH`, `STRING_MIN_LENGTH`, `STRING_MAX_LENGTH`, `STRING_IN`, `STRING_PATTERN_MISMATCH`, `STRING_IP_FORMAT`, `STRING_CUSTOM_VALIDATION`

NUMBER: `NUMBER_TYPE_ERROR`, `NUMBER_MIN`, `NUMBER_MAX`, `NUMBER_IN`, `NUMBER_NAN_NOT_ALLOWED`, `NUMBER_INFINITY_NOT_ALLOWED`, `NUMBER_UNSAFE`, `NUMBER_CUSTOM_VALIDATION`

ARRAY: `ARRAY_TYPE_ERROR`, `ARRAY_MIN_LENGTH`, `ARRAY_MAX_LENGTH`, `ARRAY_EXACT_LENGTH`, `ARRAY_UNIQUE`, `ARRAY_IN`, `ARRAY_CUSTOM_VALIDATION`

OBJECT: `OBJECT_TYPE_ERROR`, `OBJECT_KEYS_MIN`, `OBJECT_KEYS_MAX`, `OBJECT_KEYS_LENGTH`, `OBJECT_EXTRA_KEYS`, `OBJECT_CUSTOM_VALIDATION`

BOOLEAN: `BOOLEAN_TYPE_ERROR`, `BOOLEAN_NOT_TRUE`, `BOOLEAN_NOT_FALSE`, `BOOLEAN_CUSTOM_VALIDATION`

DATE: `DATE_TYPE_ERROR`, `DATE_MIN`, `DATE_MAX`, `DATE_CUSTOM_VALIDATION`

---

## Usage Patterns

### Scalar validation

```js
const v = Validator.string().required().min(3).max(50)
if (!v.validate(input)) {
    console.log(v.errors)
}
```

### Object schema

```js
const schema = Validator.object({
    email: Validator.string().required().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    age:   Validator.number().required().min(18),
}).strict()

const ok = schema.validate(req.body)
if (!ok) return res.status(400).json({ errors: schema.errors })
```

### Nested objects

```js
const schema = Validator.object({
    address: Validator.object({
        zip: Validator.string().required().pattern(/^\d{5}$/),
    }).required(),
})
schema.validate({ address: { zip: 'bad' } })
// errors[0].field === 'address.zip'
```

### Array of typed items

```js
const schema = Validator.array(Validator.string().min(1)).min(1).unique()
schema.validate(['a', 'b', ''])
// errors[0].field === '[2]', code === 'STRING_MIN_LENGTH'
```

### Custom rule

```js
const schema = Validator.string().fn((value, errors) => {
    if (value === 'reserved') {
        errors.push({ field: null, code: 'RESERVED', message: 'This name is reserved.' })
    }
})
```

---

## Constraints / Gotchas

- The default export is the `Validator` factory class — do not instantiate it directly; use the static methods
- `.validate()` mutates `.errors` in place on every call; always read `.errors` after the specific `.validate()` call
- All rules accumulate errors — validation does not stop on the first failure
- `undefined` input passes silently unless `.required()` is called
- `null` input fails with a type error unless `.nullable()` is called
- `ValidatorBoolean` has no `.nullable()` method; passing `null` produces `BOOLEAN_TYPE_ERROR`
- `ValidatorNumber` general rules (NaN, Infinity, unsafe) are always registered at construction time; they cannot be removed
- `Validator.number({ allowUnsafe: false })` uses `Number.isSafeInteger()` which returns `false` for floats — only use this for integer validation
- `ValidatorDate` with `string: false, number: false` only accepts `Date` objects
- `ValidatorObject` field errors mutate the `val.field` property of each error object inline — do not reuse error objects across calls
- `ValidatorArray` item errors use `[index]` prefix with dot-joined nested paths, not bracket notation for nested fields
