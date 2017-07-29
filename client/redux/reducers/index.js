const INITIAL_STATE = {
	isAuthenticated: null,
	permissions: [],
};

export default function authReducer(state = INITIAL_STATE, action) {
	switch (action.type) {
		default: 
			return {
				...state,
			};
	}
}

index.reducer = 'auth';
