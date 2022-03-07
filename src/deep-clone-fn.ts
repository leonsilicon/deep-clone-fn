/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/ban-types */

import rfdc from 'rfdc';

const clone = rfdc();

const copyProperty = (
	to: object,
	from: object,
	property: string | symbol,
	ignoreNonConfigurable: boolean
) => {
	// `Function#length` should reflect the parameters of `to` not `from` since we keep its body.
	// `Function#prototype` is non-writable and non-configurable so can never be modified.
	if (property === 'length' || property === 'prototype') {
		return;
	}

	// `Function#arguments` and `Function#caller` should not be copied. They were reported to be present in `Reflect.ownKeys` for some devices in React Native (#41), so we explicitly ignore them here.
	if (property === 'arguments' || property === 'caller') {
		return;
	}

	const toDescriptor = Object.getOwnPropertyDescriptor(to, property);
	const fromDescriptor = Object.getOwnPropertyDescriptor(from, property)!;

	if (!canCopyProperty(toDescriptor, fromDescriptor) && ignoreNonConfigurable) {
		return;
	}

	Object.defineProperty(to, property, {
		...fromDescriptor,
		value: clone(fromDescriptor?.value),
	});
};

// `Object.defineProperty()` throws if the property exists, is not configurable and either:
// - one its descriptors is changed
// - it is non-writable and its value is changed
const canCopyProperty = function (
	toDescriptor: PropertyDescriptor | undefined,
	fromDescriptor: PropertyDescriptor
) {
	return (
		toDescriptor === undefined ||
		toDescriptor.configurable ||
		(toDescriptor.writable === fromDescriptor.writable &&
			toDescriptor.enumerable === fromDescriptor.enumerable &&
			toDescriptor.configurable === fromDescriptor.configurable &&
			(toDescriptor.writable || toDescriptor.value === fromDescriptor.value))
	);
};

const changePrototype = (to: object, from: object) => {
	const fromPrototype = Object.getPrototypeOf(from);
	if (fromPrototype === Object.getPrototypeOf(to)) {
		return;
	}

	Object.setPrototypeOf(to, fromPrototype);
};

const wrappedToString = (withName: string, fromBody: string) =>
	`/* Wrapped ${withName}*/\n${fromBody}`;

const toStringDescriptor = Object.getOwnPropertyDescriptor(
	Function.prototype,
	'toString'
);
const toStringName = Object.getOwnPropertyDescriptor(
	Function.prototype.toString,
	'name'
)!;

// We call `from.toString()` early (not lazily) to ensure `from` can be garbage collected.
// We use `bind()` instead of a closure for the same reason.
// Calling `from.toString()` early also allows caching it in case `to.toString()` is called several times.
const changeToString = (to: object, from: object, name: string) => {
	const withName = name === '' ? '' : `with ${name.trim()}() `;
	const newToString = wrappedToString.bind(null, withName, from.toString());
	// Ensure `to.toString.toString` is non-enumerable and has the same `same`
	Object.defineProperty(newToString, 'name', toStringName);
	Object.defineProperty(to, 'toString', {
		...toStringDescriptor,
		value: newToString,
	});
};

export interface DeepCloneFunctionOptions {
	/**
	Skip modifying [non-configurable properties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor#Description) instead of throwing an error.
	@default false
	*/
	readonly ignoreNonConfigurable?: boolean;
}

export default function deepCloneFunction<F>(
	fn: F,
	{ ignoreNonConfigurable = false }: DeepCloneFunctionOptions = {}
): F {
	const fnToClone = fn as any;
	const { name } = fnToClone;

	function clonedFn(...args: any[]) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
		return fnToClone(...(args as any));
	}

	for (const property of Reflect.ownKeys(fnToClone)) {
		copyProperty(clonedFn, fnToClone, property, ignoreNonConfigurable);
	}

	changePrototype(clonedFn, fnToClone);
	changeToString(clonedFn, fnToClone, name);

	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return clonedFn as any;
}
