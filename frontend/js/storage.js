export const Store = {
    setItem: (k, v) => localStorage.setItem(k, v),
    getItem: (k) => localStorage.getItem(k),
    removeItem: (k) => localStorage.removeItem(k)
};