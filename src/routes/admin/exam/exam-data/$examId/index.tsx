import { TabPaneNavigation } from '@/components/TabPaneNavigation'
import { cn } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'
import { QuestionPane } from '../-panes/QuestionPane'
import { StudentPane } from '../-panes/StudentPane'

const tab_id = ["soal ujian", "peserta ujian"]
export const Route = createFileRoute('/admin/exam/exam-data/$examId/')({
  validateSearch: (search) => z.object({
    tab: z.enum(tab_id).optional(),
  }).parse(search),
  component: RouteComponent,
})

function RouteComponent() {
  const {tab = tab_id[0]} = Route.useSearch()
  const {examId} = Route.useParams()
  
  return (
    <>
    <TabPaneNavigation tabs={tab_id} activeTab={tab_id.includes(tab) ? tab : tab_id[0]} from={`/admin/exam/exam-data/$examId`} />
    <div className="tab-content">

            <div
              className={cn(
                `tab-pane`,
                {
                  [`active`]: (tab === `soal ujian`),
                }
              )}
              role={`tabpanel`}
            >
              <QuestionPane examId={examId} />
            </div>

            <div
              className={cn(
                `tab-pane`,
                {
                  [`active`]: (tab === `peserta ujian`),
                }
              )}
              role={`tabpanel`}
            >
              <StudentPane examId={examId} />
            </div>

          </div>
    </>
  )
}
