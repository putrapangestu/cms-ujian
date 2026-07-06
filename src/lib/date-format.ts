import dayjs from 'dayjs'
import 'dayjs/locale/id'

dayjs.locale('id')

export const formatTime = (dateString: string) => {
  return dayjs(dateString).format('HH:mm')
}

export const formatDate = (dateString: string) => {
  return dayjs(dateString).format('D MMMM YYYY')
}
