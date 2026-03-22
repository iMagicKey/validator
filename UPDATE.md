# UPDATE — imagic-validator

> Аудит проведён: 2026-03-22. Версия на момент аудита: 3.0.10

---

## Критические баги (исправить немедленно)

- [ ] **IPv6 compressed notation не валидируется** — `string().ip()` использует regex:
  ```
  /^([0-9a-fA-F]{1,4}:){7}([0-9a-fA-F]{1,4})$/
  ```
  Этот regex принимает только полные 8-группные адреса. `::1` (loopback), `2001:db8::1`, `fe80::1` — всё это **валидные** IPv6 адреса, которые падают с ошибкой. Нужно использовать RFC 4291-совместимый regex или валидацию через `node:net`.

- [ ] **Not concurrency-safe** — `validate()` сбрасывает `this.errors = []` в начале. Два одновременных async-вызова `validate()` на одном и том же экземпляре схемы смешивают ошибки друг с другом. В route-обработчиках это реальный сценарий. Ошибки должны быть локальны вызову:
  ```js
  validate(value) {
      const errors = []  // локальный, не this.errors
      // ... собираем ошибки в errors
      this.errors = errors  // присваиваем только в конце
      return errors.length === 0
  }
  ```

- [ ] **`number()` — `allowNaN: true` и `allowInfinity: true` по умолчанию** — `IMV.number().validate(NaN)` возвращает `true`. Почти никогда не желаемое поведение. Изменить defaults на `false`. **BREAKING CHANGE** — требует MAJOR bump или как минимум явного документирования.

- [ ] **`string().in()` — отсутствует поле `field`** — объект ошибки не содержит `field: null`, что есть у всех других валидаторов. Непоследовательность в формате ошибок.

---

## package.json

- [ ] Добавить `"engines": { "node": ">=20" }` (сейчас отсутствует)
- [ ] Добавить `"exports"`:
  ```json
  "exports": { ".": "./src/index.js", "./package.json": "./package.json" }
  ```
- [ ] Добавить `"files": ["src", "README.md", "LICENSE"]`
- [ ] Добавить `"sideEffects": false`
- [ ] Обновить `devDependencies`:
  ```json
  "@eslint/js": "^10.0.1",
  "chai": "^5.x",
  "eslint": "^10.1.0",
  "eslint-config-prettier": "^10.1.8",
  "eslint-plugin-import": "^2.32.0",
  "eslint-plugin-n": "^17.24.0",
  "eslint-plugin-prettier": "^5.5.5",
  "eslint-plugin-promise": "^7.2.1",
  "globals": "^16.x",
  "prettier": "^3.8.1"
  ```
- [ ] Удалить Mocha из зависимостей после миграции на `node:test`

---

## ESLint

- [ ] **ESLint config отсутствует полностью** — создать `eslint.config.js` по стандарту
- [ ] Создать `.prettierrc.json`
- [ ] Установить ESLint `^10.1.0`

---

## Тесты

Мигрировать с Mocha → `node:test`:

- [ ] Переименовать `test/` → `tests/`
- [ ] Заменить Mocha `describe/it` на `node:test` `describe/it`
- [ ] Обновить `"scripts.test"` на `node --test ./tests/**/*.test.js`

Добавить тесты:

- [ ] IPv6 compressed notation (`::1`, `2001:db8::1`) — должна пройти валидацию
- [ ] IPv4-mapped IPv6 (`::ffff:192.0.2.1`) — должна пройти
- [ ] Concurrent `validate()` вызовы на одном экземпляре не смешивают ошибки
- [ ] `number().validate(NaN)` — `false` после изменения дефолта
- [ ] `number().validate(Infinity)` — `false` после изменения дефолта
- [ ] `string().in([]).validate('x')` — `false`, объект ошибки содержит `field: null`
- [ ] `array()` item validator — ошибки содержат индекс в `field`
- [ ] `object()` с вложенным `object()` — ошибки имеют dotted путь (`address.city`)
- [ ] Все 6 типов: комбинация `nullable()` + `required()`

---

## Улучшения API (minor bump)

- [ ] **`getErrorsByField(fieldName)`** — вспомогательный метод для получения ошибок по полю:
  ```js
  const errors = validator.getErrorsByField('email')
  // → [{ field: 'email', code: 'INVALID_FORMAT', message: '...' }]
  ```

- [ ] **Async validation** — поддержка async-callback в цепочке:
  ```js
  IMV.string().custom(async (value) => {
      const exists = await db.user.findOne({ email: value })
      if (exists) throw new Error('Email already taken')
  })
  ```

- [ ] **`BaseValidator` рефакторинг** — логика проверки типа и required дублируется в всех 5 классах типов (`Array.js`, `String.js`, `Number.js`, `Object.js`, `Boolean.js`, `Date.js`). Вынести в `src/types/Base.js`.

---

## Задачи (backlog)

- [ ] i18n сообщений об ошибках (сейчас все сообщения захардкожены на английском)
- [ ] `string().email()` — добавить стандартный email-валидатор
- [ ] `string().url()` — добавить URL-валидатор
- [ ] `string().uuid()` — добавить UUID v4-валидатор
- [ ] TypeScript `.d.ts`
- [ ] JSON Schema совместимость (экспорт схем в JSON Schema формат)
