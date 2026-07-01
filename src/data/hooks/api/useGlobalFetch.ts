import { type ObjectType } from '@/data/types/object'
import { fetcher } from '@/lib/api-client'
import { toaster } from '@/lib/toast'
import { Axios, type AxiosRequestConfig } from 'axios'
import { useEffect } from 'react'
import useSWR, { mutate } from 'swr'
import useSWRMutation from 'swr/mutation'

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
    dedupingInterval: 30000,
  })
}

const localStorageMiddleware = (useSWRNext: any) => {
  return (key: any, fetcher: any, config: any) => {
    // Gunakan URL atau string key sebagai nama key di localStorage
    const storageKey = Array.isArray(key) ? JSON.stringify(key) : key

    const swr = useSWRNext(key, fetcher, {
      ...config,
      // Load data awal dari localStorage saat inisialisasi
      fallbackData:
        config.fallbackData ??
        (() => {
          if (typeof window === 'undefined') return undefined
          const item = localStorage.getItem(storageKey)
          return item ? JSON.parse(item) : undefined
        })(),
    })

    // Simpan ke localStorage saat data berubah
    useEffect(() => {
      if (swr.data !== undefined) {
        localStorage.setItem(storageKey, JSON.stringify(swr.data))
      }
    }, [storageKey, swr.data])

    return swr
  }
}

export const useQueryDataPersistent = <T>(
  url: string,
  params?: ObjectType<any>,
  options?: { revalidateOnMount?: boolean },
) => {
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
    revalidateOnMount: options?.revalidateOnMount ?? false,
    use: [localStorageMiddleware],
  })
}

export const useMutationAction = (
  url: string,
  method: 'post' | 'put' | 'delete' | 'get' | 'patch',
  config?: {
    refreshKey?: string
    onSuccess?: (data?: any) => void
    onError?: (err?: any) => void
    axiosConfig?: AxiosRequestConfig
    showMessage?: boolean
  },
) =>
  useSWRMutation(
    url,
    async (key: string, { arg }: { arg: any }) => {
      const options = config?.axiosConfig
      if (method === 'get') return fetcher['get'](key, arg, options)
      return fetcher[method](key, { arg }, options)
    },
    {
      onError: (err) => {
        if (config?.onError) {
          config.onError(err)
          return
        }
        if (config?.showMessage === false) return

        const msg =
          err?.response?.data?.message ||
          err?.response?.message ||
          err?.response?.data?.error ||
          err?.response?.error ||
          ''

        // Jika ada validation errors per field, tampilkan detailnya
        const errors = err?.response?.data?.errors
        if (errors && typeof errors === 'object' && Object.keys(errors).length > 0) {
          const firstField = Object.keys(errors)[0]
          const firstMsg = typeof errors[firstField] === 'string'
            ? errors[firstField]
            : Array.isArray(errors[firstField])
              ? errors[firstField][0]
              : ''
          
          if (firstMsg) {
            toaster(firstMsg, 'error')
          } else if (msg) {
            toaster(msg, 'error')
          } else {
            toaster('Data yang Anda masukkan tidak valid. Silakan periksa kembali.', 'error')
          }
          return
        }

        // Untuk error 422 tanpa detail field (misal dari validator global)
        const status = err?.response?.status
        if (status === 422 && msg) {
          toaster(msg, 'error')
          return
        }

        // Fallback berdasarkan status code
        const statusMessages: Record<number, string> = {
          400: 'Data yang Anda kirim tidak sesuai. Silakan periksa kembali.',
          401: 'Sesi Anda telah berakhir. Silakan login kembali.',
          403: 'Anda tidak memiliki izin untuk melakukan tindakan ini.',
          404: 'Data yang Anda cari tidak ditemukan.',
          409: 'Terjadi bentrok data. Silakan coba lagi.',
          422: 'Data yang Anda masukkan tidak valid.',
          429: 'Terlalu banyak permintaan. Silakan coba beberapa saat lagi.',
          500: 'Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.',
          502: 'Server sedang sibuk. Silakan coba lagi nanti.',
          503: 'Server sedang dalam perawatan. Silakan coba lagi nanti.',
        }

        toaster(msg || statusMessages[status] || 'Terjadi kesalahan. Silakan coba lagi.', 'error')
      },
      onSuccess: (data) => {
        if (config?.showMessage !== false)
          toaster(data?.message || 'Berhasil', 'success')
        if (config?.refreshKey)
          mutate(
            (key) => {
              if (Array.isArray(key) && key[0] === config.refreshKey)
                return true
              if (key === config.refreshKey) return true
              return false
            },
            undefined,
            { revalidate: true },
          )
        config?.onSuccess?.(data)
      },
    },
  )
