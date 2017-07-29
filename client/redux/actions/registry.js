import { STORE_INJECT } from '../registry/middleware';

export function injectReducers(reducers) {
	return {
		[ STORE_INECT]: { reducers },
	};
}
