import { AUTH } from '@/data/const/api_url'
import { useAuthStore } from '@/data/store/auth_store'
import { fetcher } from '@/lib/api-client'
import { toaster } from '@/lib/toast'
import { useNavigate } from '@tanstack/react-router'
import useSWRMutation from 'swr/mutation'

export const useLogin = () => {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  return useSWRMutation(AUTH.LOGIN, fetcher.post, {
    onSuccess: (d) => {
      login(d.data, false)
      toaster(d.message, 'success')
      navigate({ to: '/admin' })
    },
    onError: (e) => {
      console.log('Login gagal: ', e)
      toaster(e.response.data.message || 'Login gagal', 'error')
    },
  })
}

export const useRegister = () => {
  const navigate = useNavigate()

  return useSWRMutation(AUTH.REGISTER, fetcher.post, {
    onError: (err) => {
      console.error('Register failed:', err)
      toaster(err.response.data.message || err.response.message, 'error')
    },
    onSuccess: (data) => {
      toaster(`${data.message}`, 'success', 2000)
      navigate({ to: '/must-verify' })
    },
  })
}

export const useVerify = () => {
  const navigate = useNavigate()

  return useSWRMutation(
    AUTH.VERIFY_EMAIL,
    (url, { arg }: { arg: any }) => fetcher.get(url, arg),
    {
      onSuccess: (d) => {
        toaster(
          d.message || d.data?.message || 'Verifikasi berhasil',
          'success',
        ) // Using d.message as per useLogin
        navigate({ to: '/login' }) // Navigate to login on success
      },
      onError: (e) => {
        console.log('Verifikasi gagal: ', e)
        toaster(e.response?.data?.message || 'Verifikasi gagal', 'error')
      },
    },
  )
}

export const useSendResetPassword = () => {
  return useSWRMutation(AUTH.SEND_RESET_PASSWORD, fetcher.post, {
    onError: (err) => {
      console.error('Send reset password failed:', err)
      toaster(err.response.data.message, 'error')
      return false
    },
    onSuccess: (data) => {
      toaster(`${data.message}`, 'success', 2000)
      return true
      // navigate({ to: '/' })
    },
  })
}

export const useCheckToken = (token: string) => {
  return useSWRMutation(
    AUTH.CHECK_TOKEN.replace('{token}', token),
    fetcher.get,
    {
      onError: (err) => {
        console.error('Check token failed:', err)
        return true
      },
      onSuccess: (data) => {
        return false
      },
    },
  )
}

export const useForgotPassword = () => {
  const navigate = useNavigate()

  return useSWRMutation(AUTH.FORGOT_PASSWORD, fetcher.post, {
    onError: (err) => {
      console.error('Forgot password failed:', err)
      toaster(err.response.data.message || err.response.message, 'error')
    },
    onSuccess: (data) => {
      toaster(`${data.message}`, 'success', 2000)
      navigate({ to: '/login' })
    },
  })
}
