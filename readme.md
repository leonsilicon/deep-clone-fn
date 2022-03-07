# deep-clone-fn

A modification of Sindre Sorhus' excellent [mimic-fn](https://www.npmjs.com/package/mimic-fn) for deep cloning functions.

```typescript
function f(x) {
  return x;
}

f.myProperty = { foo: 'bar' };

const g = deepCloneFunction(f);

f.myProperty.foo = 'baz';

console.log(g.myProperty); // { foo: 'bar' }
console.log(g('foo')); // foo
```
