# Tests

Run tests from the repository root with Node.js 26 LTS and its bundled npm:

```sh
npm ci
npm test
```

Run an individual test with `node --test tests/infrastructure/tooling.test.js`.
Use `node:test` and `node:assert/strict` in `*.test.js` files. Keep fixtures
separate from test cases, mirror runtime modules as they are introduced, and
test hosts separately. A failing assertion must result in a nonzero exit
status. The current smoke test verifies ES module imports and native assertions,
not engine behavior.

Future runtime tests should cover valid and invalid actions, deterministic
transitions, ownership and save/restore equivalence where applicable.
