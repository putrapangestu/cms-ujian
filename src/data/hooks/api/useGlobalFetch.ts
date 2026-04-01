import { type ObjectType } from "@/data/types/object"
import { fetcher } from "@/lib/api-client"
import { toaster } from "@/lib/toast"
import { Axios, type AxiosRequestConfig } from "axios"
import { useEffect } from "react"
import useSWR, { mutate } from "swr"
import useSWRMutation from "swr/mutation"

export const useQueryData = <T>(url: string, params?: ObjectType<any>) => {
    const new_url = params ? [url, params] : url

    const fetcherWrapper = (keyData: string | [string, any]) => {
        if (Array.isArray(keyData)) {
            return fetcher.get(keyData[0], keyData[1])
        }
        return fetcher.get(keyData)
    }

    return useSWR<T>(new_url, fetcherWrapper, {
        revalidateOnFocus: false,
        dedupingInterval: 30000
    })
}

const localStorageMiddleware = (useSWRNext: any) => {
  return (key: any, fetcher: any, config: any) => {
    // Gunakan URL atau string key sebagai nama key di localStorage
    const storageKey = Array.isArray(key) ? JSON.stringify(key) : key;

    const swr = useSWRNext(key, fetcher, {
      ...config,
      // Load data awal dari localStorage saat inisialisasi
      fallbackData: config.fallbackData ?? (() => {
        if (typeof window === 'undefined') return undefined;
        const item = localStorage.getItem(storageKey);
        return item ? JSON.parse(item) : undefined;
      })()
    });

    // Simpan ke localStorage saat data berubah
    useEffect(() => {
      if (swr.data !== undefined) {
        localStorage.setItem(storageKey, JSON.stringify(swr.data));
      }
    }, [storageKey, swr.data]);

    return swr;
  };
};

export const useQueryDataPersistent = <T>(url: string, params?: ObjectType<any>) => {
    const new_url = params ? [url, params] : url

    const fetcherWrapper = (keyData: string | [string, any]) => {
        if (Array.isArray(keyData)) {
            return fetcher.get(keyData[0], keyData[1])
        }
        return fetcher.get(keyData)
    }

    return useSWR<T>(new_url, fetcherWrapper, {
        revalidateOnFocus: false,
        dedupingInterval: 30000,
        // Tambahkan middleware di sini
        use: [localStorageMiddleware]
    })
}

export const useMutationAction = (
    url: string,
    method: 'post' | 'put' | 'delete' | 'get' | 'patch',
    config?: {
        refreshKey?: string,
        onSuccess?: () => void,
        axiosConfig?: AxiosRequestConfig,
        showMessage?: boolean,
    }
) => ( useSWRMutation(
    url,
    async (key: string, { arg }: { arg: any}) => {
        const options = config?.axiosConfig
        if(method === 'get') return fetcher['get'](key, arg, options)
        return fetcher[method](key, {arg}, options)
    },
    {
        onError: (err) => {
            const msg = err?.response?.data?.message || err?.response?.message || err?.response?.data?.error || err?.response?.error || 'Terjadi kesalahan'
            if(config?.showMessage !== false) toaster(msg, 'error')
        },
        onSuccess: (data) => {
            if(config?.showMessage !== false) toaster(data?.message || 'Berhasil', 'success')
            if(config?.refreshKey) mutate(
                (key) => {
                    if (Array.isArray(key) && key[0] === config.refreshKey) return true
                    if (key === config.refreshKey) return true
                    return false
                },
                undefined, 
                { revalidate: true }
            )
            config?.onSuccess?.()
        }
    }
) )