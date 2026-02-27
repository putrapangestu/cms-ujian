import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/data/store/auth_store'
import { useEffect } from 'react'
// import { PageLoader } from '@/components/Loader'
import { useGlobalStore } from '@/data/store/global_store'
import AdminSidebar from './-layout/admin_sidebar'
import AdminHeader from './-layout/admin_header'

export const Route = createFileRoute('/admin')({
  component: RouteComponent,
})

function RouteComponent() {
  const { isAuthenticated, isFetched } = useAuthStore()
  const { isMounted } = useGlobalStore()
  const navigate = useNavigate()

  useEffect(() => {
    const checkSession = async () => { if(!isAuthenticated) navigate({to: "/login"}) }
    if(isFetched) checkSession()
  }, [isFetched, isAuthenticated])

  useEffect(() => {
    if (!isMounted) return;

    const handleToggleClick = () => {
      document.querySelectorAll(".sidebartoggler").forEach((el) => {
        // @ts-ignore
        el.checked = true; 
      });
      
      const wrapper = document.getElementById("main-wrapper");
      if (wrapper) wrapper.classList.toggle("show-sidebar");

      document.querySelectorAll(".sidebarmenu").forEach((el) => { el.classList.toggle("close") });

      const dataTheme = document.body.getAttribute("data-sidebartype")
      if (dataTheme === "full") document.body.setAttribute("data-sidebartype", "mini-sidebar")
      else document.body.setAttribute("data-sidebartype", "full")
    };

    const togglers = document.querySelectorAll(".sidebartoggler");
    togglers.forEach((element) => {
      element.addEventListener("click", handleToggleClick);
    });

    return () => {
      togglers.forEach((element) => {
        element.removeEventListener("click", handleToggleClick);
      });
    };

  }, [isMounted]);

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
