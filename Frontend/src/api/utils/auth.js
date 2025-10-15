export const setToken = token => localStorage.setItem('jwt_token', token)
export const getToken = () => localStorage.getItem('jwt_token')
export const removeToken = () => localStorage.removeItem('jwt_token')
export const isLoggedIn = () => !!getToken()
