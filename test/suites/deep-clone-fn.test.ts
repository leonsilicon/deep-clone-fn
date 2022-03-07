/* eslint-disable @typescript-eslint/no-empty-function */
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

const foo = function (bar: unknown) {
	return bar;
};

foo.unicorn = '🦄';

const symbol = Symbol('🦄');
(foo as any)[symbol] = '✨';

const parent = function () {};

parent.inheritedProp = true;
Object.setPrototypeOf(foo, parent);

test('should copy `name`', () => {
	const cloned = deepCloneFunction(foo);
	expect(cloned.name).toEqual(foo.name);
});

test('should copy other properties', () => {
	const cloned = deepCloneFunction(foo);
	expect(cloned.unicorn).toEqual(foo.unicorn);
});

test('should copy symbol properties', () => {
	const cloned = deepCloneFunction(foo);
	expect((cloned as any)[symbol], (foo as any)[symbol]);
});

test('should copy `length`', () => {
	const cloned = deepCloneFunction(foo);
	expect(cloned.length).toEqual(foo.length);
});

test('should keep descriptors', () => {
	const cloned = deepCloneFunction(foo);
	const {
		length: fooLength,
		toString: _fooToString,
		...fooProperties
	} = Object.getOwnPropertyDescriptors(foo);
	const {
		length: clonedLength,
		toString: _clonedToString,
		...clonedProperties
	} = Object.getOwnPropertyDescriptors(cloned);
	expect(fooProperties).toEqual(clonedProperties);
	expect(fooLength).toEqual(clonedLength);
});

test('should copy inherited properties', () => {
	const cloned = deepCloneFunction(foo);

	expect((cloned as any).inheritedProp).toEqual((foo as any).inheritedProp);
});

test('should allow classes to be copied', () => {
	// eslint-disable-next-line @typescript-eslint/no-extraneous-class
	class FooClass {}

	// eslint-disable-next-line @typescript-eslint/naming-convention
	const ClonedClass = deepCloneFunction(FooClass);

	expect(ClonedClass.name).toEqual(FooClass.name);
	expect(ClonedClass.prototype).toEqual(FooClass.prototype);
});

test('should keep toString() the same', () => {
	const cloned = deepCloneFunction(foo);

	expect(cloned.toString()).toEqual(foo.toString());
});

test('should keep toString() non-enumerable', () => {
	const cloned = deepCloneFunction(foo);

	const { enumerable } = Object.getOwnPropertyDescriptor(cloned, 'toString')!;
	expect(enumerable).toBe(false);
});

test('should not modify toString.name', () => {
	const cloned = deepCloneFunction(foo);
	expect(cloned.toString.name).toEqual('toString');
});
