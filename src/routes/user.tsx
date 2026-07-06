import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/data/store/auth_store'
import { useEffect } from 'react'
// import { PageLoader } from '@/components/Loader'
import { useGlobalStore } from '@/data/store/global_store'
import AdminSidebar from './-layout/admin_sidebar'
import AdminHeader from './-layout/admin_header'

export const Route = createFileRoute('/user')({
  component: RouteComponent,
})

function RouteComponent() {
  const { isAuthenticated, isFetched } = useAuthStore()
  const { isMounted } = useGlobalStore()
  const navigate = useNavigate()

  useEffect(() => {
    const checkSession = async () => {
      if (!isAuthenticated) navigate({ to: '/login' })
    }
    if (isFetched) checkSession()
  }, [isFetched, isAuthenticated])

  //   if(!isMounted) return <PageLoader />

  return (
    <>
      <div id="main-wrapper">
        <AdminSidebar />
        <div className="page-wrapper">
          <AdminHeader />
          <div className="body-wrapper pb-4">
            <div className="container-fluid">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
