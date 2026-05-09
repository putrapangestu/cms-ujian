import { createFileRoute } from '@tanstack/react-router'
import { IconEye, IconEyeClosed } from '@tabler/icons-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/Form'
import { useLogin } from '@/data/hooks/api/useAuth'

export const Route = createFileRoute('/_auth/login')({
  component: RouteComponent,
})

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type LoginFormData = z.infer<typeof loginSchema>

function RouteComponent() {
  const { trigger, isMutating } = useLogin()

  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginFormData>({
    mode: 'onChange',
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  return (
    <div className="col-xl-5 col-xxl-4">
      <div className="authentication-login min-vh-100 bg-body row justify-content-center align-items-center p-4">
        <div className="auth-max-width col-sm-8 col-md-6 col-xl-7 px-4">
          <h2 className="mb-1 fs-7 fw-bolder">Selamat Datang</h2>
          <p className="mb-7">Aplikasi AN Ujian </p>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => trigger(data))}>
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <input
                        className="form-control"
                        placeholder="Masukkan username"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <div>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="input-group">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="form-control"
                          placeholder="Masukkan password"
                          {...field}
                        />
                        <button
                          type="button"
                          className="btn btn-primary-light"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {!showPassword ? (
                            <IconEye width={14} />
                          ) : (
                            <IconEyeClosed width={14} />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </div>
                )}
              />

              {/* Submit */}
              <button
                type="submit"
                className="btn btn-primary w-100 py-8 mb-4 rounded-2 mt-3"
                disabled={form.formState.isSubmitting || isMutating}
              >
                {form.formState.isSubmitting || isMutating ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
