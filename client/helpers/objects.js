export function isPlainObject(value) {
	return Boolean(value)
		&& typeof value === 'object'
		&& Object.prototype.toString.call(value) === '[object Object]';
}
