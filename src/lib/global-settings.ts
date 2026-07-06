import dayjs from 'dayjs'
import 'dayjs/locale/id'
import relativeTime from 'dayjs/plugin/relativeTime'
import z from 'zod'
import { id } from 'zod/v4/locales'

dayjs.extend(relativeTime)
dayjs.locale('id')

z.config(id())
