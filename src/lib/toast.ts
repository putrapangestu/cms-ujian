import Swal, { type SweetAlertIcon } from 'sweetalert2'

export const toaster = (
  msg: string,
  icon: SweetAlertIcon,
  duration: number = 5000,
) => {
  Swal.fire({
    icon,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: duration,
    timerProgressBar: true,
    title: msg,
    theme: 'bootstrap-5',
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer
      toast.onmouseleave = Swal.resumeTimer
    },
  })
}

export const deleteDataAlert = (
  name: string,
  trigger: () => void,
  action: string = 'menghapus',
) => {
  Swal.fire({
    title: 'Data Akan Dihapus',
    text: `Apakah anda yakin ingin ${action} ${name}?`,
    icon: 'warning',
    confirmButtonText: 'Yakin!',
    cancelButtonText: 'Batal',
    showCancelButton: true,
    theme: 'bootstrap-5',
  }).then((r) => {
    if (r.isConfirmed) trigger()
  })
}

export const confirmAlert = (
  title: string,
  trigger: () => void,
  message: string,
  onSuccess: () => void,
) => {
  Swal.fire({
    title: title,
    text: message,
    icon: 'warning',
    confirmButtonText: 'Yakin!',
    cancelButtonText: 'Batal',
    showCancelButton: true,
    theme: 'bootstrap-5',
    showLoaderOnConfirm: true,
    preConfirm: async () => await trigger(),
  }).then((r) => {
    if (r.isConfirmed) onSuccess()
  })
}
