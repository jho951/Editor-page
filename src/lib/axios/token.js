let provider = () => null;

const attachAuthTokenProvider = (fn) => {
    provider = typeof fn === 'function' ? fn : () => null;
};

export { attachAuthTokenProvider };
export const getAuthToken = () => provider();
