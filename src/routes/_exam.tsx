import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_exam')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div id="main_content">
      <Outlet />
    </div>
  )
}
