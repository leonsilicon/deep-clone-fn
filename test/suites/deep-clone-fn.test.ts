import { expect, test } from 'vitest';
import deepCloneFunction from '~/index.js';

test('successfully deep clones a function', () => {
	function f<T>(x: T): T {
		return x;
	}

	f.myProperty = { foo: 'bar' };

	const g = deepCloneFunction(f);

	f.myProperty.foo = 'baz';

	expect(g.myProperty).toEqual({ foo: 'bar' });
	expect(g('foo')).toEqual('foo');
});
