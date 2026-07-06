import { createFileRoute } from '@tanstack/react-router'
import { User } from 'lucide-react'
import { useAuthStore } from '@/data/store/auth_store'
import { useUpdateProfile } from '@/data/hooks/api/useAuth'
import { useState, useRef } from 'react'

export const Route = createFileRoute('/admin/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useAuthStore()
  const { trigger, isMutating } = useUpdateProfile()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(user?.name || '')
  const [email] = useState(user?.email || '')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setAvatarPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append('_method', 'PUT')

    if (name !== user?.name) formData.append('name', name)
    if (password) {
      formData.append('password', password)
      formData.append('password_confirmation', passwordConfirmation)
    }
    if (avatarFile) formData.append('avatar', avatarFile)

    // Pastikan ada data yang diubah
    if ([...formData.entries()].length <= 1) {
      // Only _method, no actual data changed
      return
    }

    try {
      await trigger(formData as any)
      if (avatarFile) {
        setAvatarFile(null)
        setAvatarPreview(null)
      }
      setPassword('')
      setPasswordConfirmation('')
    } catch {
      // Error handled by hook
    }
  }

  const currentAvatar = avatarPreview
    || (user?.avatar ? `${import.meta.env.VITE_API_URL}/${user.avatar}` : null)

  return (
    <div className="container-fluid p-4">
      {/* Header Section */}
      <div className="d-flex align-items-center mb-4 pb-2 border-bottom">
        <div className="bg-primary text-white rounded p-2 me-3 shadow-sm d-flex align-items-center justify-content-center">
          <User size={24} strokeWidth={2.5} />
        </div>
        <div>
          <h4 className="mb-0 fw-bold text-dark">Profile Saya</h4>
          <small className="text-muted">
            Kelola informasi profile dan akun Anda
          </small>
        </div>
      </div>

      <div className="row g-4">
        {/* Avatar Section */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <div className="mb-4">
                <img
                  src={currentAvatar || '/profile/user-1.jpg'}
                  className="rounded-circle object-fit-cover border border-3 border-primary"
                  width="150"
                  height="150"
                  alt="Avatar"
                  style={{ cursor: 'pointer' }}
                  onClick={() => fileInputRef.current?.click()}
                />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/gif"
                className="d-none"
                onChange={handleAvatarChange}
              />
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <i className="ti ti-camera me-1"></i> Ganti Foto
              </button>
              <div className="mt-3">
                <h5 className="fw-semibold mb-1">{user?.name}</h5>
                <p className="text-muted small mb-0">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h5 className="fw-semibold mb-4">Informasi Profile</h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-medium">Nama Lengkap</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama Anda"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium">Email</label>
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    value={email}
                    disabled
                    placeholder="Email"
                  />
                  <small className="text-muted">Email tidak dapat diubah</small>
                </div>

                <hr className="my-4" />
                <h5 className="fw-semibold mb-4">Ubah Password</h5>
                <p className="text-muted small mb-3">
                  Kosongkan jika tidak ingin mengubah password
                </p>

                <div className="mb-3">
                  <label className="form-label fw-medium">Password Baru</label>
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password baru"
                    minLength={8}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium">Konfirmasi Password</label>
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    placeholder="Ulangi password baru"
                  />
                  {password && passwordConfirmation && password !== passwordConfirmation && (
                    <small className="text-danger">Password tidak cocok</small>
                  )}
                </div>

                <div className="d-flex justify-content-end mt-4 pt-3 border-top">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg px-5"
                    disabled={isMutating}
                  >
                    {isMutating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan Perubahan'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
