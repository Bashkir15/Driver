import { isPlainObject } from 'helpers/objects';

export const STORE_INJECT = Symbol('@@STORE_INECT');

export default function registryMiddleware(registry) {
	return store => next => action => {
		if (isPlainObject(action) && action.hasOwnProperty(STORE_INJECT)) {
			const { reducers } = action[STORE_INECT];

			if (reducers) {
				registry.injectReducers(reducers);
			}
			return;
		}
		return next(action);
	};
}
