import { expect, test } from 'vitest';
import deepCloneFunction from '~/index.js';

test('successfully deep clones a function', () => {
	function f() {
		return [1, 2, 3];
	}

	f.myProperty = { foo: 'bar' };

	const g = deepCloneFunction(f);

	f.myProperty.foo = 'baz';

	expect(g.myProperty).toEqual({ foo: 'bar' });
	expect(g()).toEqual([1, 2, 3]);
});
