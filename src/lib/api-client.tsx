import axios from 'axios'
import { getToken } from './token-handler'
import { useAuthStore } from '@/data/store/auth_store'

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
})

apiClient.interceptors.request.use((config) => {
    const token = getToken()
    if (token) config.headers['Authorization'] = 'Bearer ' + token
    config.headers['x-secret-key'] = import.meta.env.VITE_SECRET_KEY

    const replaceUrl = (sourceData: any) => {
        if (!config.url || !sourceData) return

        const matches = config.url.match(/{([^}]+)}/g)
        if (matches) {
            matches.forEach((match) => {
                const key = match.replace(/[{}]/g, '')

                if (sourceData instanceof FormData) {
                    if (sourceData.has(key)) {
                        const value = sourceData.get(key)
                        config.url = config.url!.replaceAll(match, value as string)
                        sourceData.delete(key)
                    }
                } else if (sourceData[key] !== undefined) {
                    config.url = config.url!.replaceAll(match, sourceData[key])
                    delete sourceData[key] 
                }
            })
        }
    }

    if (config.params) replaceUrl(config.params)
    if (config.data) replaceUrl(config.data)
    return config
}, (err) => {
    return Promise.reject(err)
})

apiClient.interceptors.response.use(
    (res) => (res),
    (err) => {
        console.error(err)
        const logout = useAuthStore.getState().logout
        if (err.response?.status === 401) logout()
        return (Promise.reject(err))
    }
)

export const fetcher = {
    get: async (url: string, params?: any) => {
        const res = await apiClient.get(url, {params})
        return res.data
    },
    post: async (url: string, {arg}: {arg:any} ) => {
        const res = await apiClient.post(url, arg)
        return res.data
    },
    put: async (url: string, {arg}: {arg:any} ) => {
        const res = await apiClient.put(url, arg)
        return res.data
    },
    patch: async (url: string, {arg}: {arg:any} ) => {
        const res = await apiClient.patch(url, arg)
        return res.data
    },
    delete: async (url: string, {arg}: {arg:any}) => {
        const res = await apiClient.delete(url, {params: arg})
        return res.data
    },
}