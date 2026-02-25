
import Cookie from 'js-cookie'

export const getToken = () => Cookie.get('token')

export const setToken = (token:string) => Cookie.set('token', token)

export const removeToken = () => Cookie.remove('token')

export const getHeaderToken = () => ({ 'Authorization': "Bearer "+getToken() })