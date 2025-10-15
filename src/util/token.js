let provider = () => null;

export const attachAuthTokenProvider = (fn) => {
    provider = typeof fn === 'function' ? fn : () => null;
};

export const getAuthToken = () => provider();
