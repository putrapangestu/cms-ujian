import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import appCss from '@/assets/css/styles.css?url'
import customCss from '@/assets/css/custom.css?url'
import vendorJs from "@/assets/js/vendor.min.js?url"
import bootstrapJs from "@/assets/libs/bootstrap/dist/js/bootstrap.bundle.min.js?url"
import appInitJs from "@/assets/js/theme/app.init.js?url"
import themeJs from "@/assets/js/theme/theme.js?url"
import appJs from "@/assets/js/theme/app.min.js?url"
import sidebarmenuJs from "@/assets/js/theme/sidebarmenu.js?url"
import jqueryJs from 'jquery/dist/jquery.min.js?url'
// import landingCss from '@/assets/landing/style.css?url'
// import landingJs from '@/assets/landing/bundle.js?url'
import { useEffect } from 'react'
import { useAuthStore } from '@/data/store/auth_store'
import { apiClient } from '@/lib/api-client'
import { AUTH } from '@/data/const/api_url'
import { useGlobalStore } from '@/data/store/global_store'
import '@/lib/global-settings' 

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: `${import.meta.env.VITE_APP_NAME}`,
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'stylesheet',
        href: customCss,
      },
      // {
      //   rel: 'stylesheet',
      //   href: landingCss,
      // },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { login, logout, isFetched, setIsFetched } = useAuthStore()
  const setIsMounted = useGlobalStore(state => state.setIsMounted)

  useEffect(() => {
    setIsMounted(true)
    const fetchAuth = async () => {
      try {
        const userData = await apiClient.get(AUTH.ME)
        login(userData.data.data)
      } catch(e) {
        console.error("Session restore failed:", e)
        logout()
      }
      setIsFetched(true)
    }

    if(!isFetched) fetchAuth()
  }, [isFetched])

  useEffect(() => {
    const handleImageError = (event: Event) => {
      const img = event.target as HTMLImageElement;

      if (img.tagName === 'IMG') {
        if(img.classList.contains('leaflet-tile')) return
        const fallbackUrl = "/not-found-img.png";
        if (img.src !== window.location.origin + fallbackUrl) {
          img.src = fallbackUrl
          img.classList.add('img-error-fallback'); 
        }
      }
    };

    window.addEventListener('error', handleImageError, true);

    return () => {
      window.removeEventListener('error', handleImageError, true);
    };
  }, [])

  return (
    <html lang="en" dir="ltr" data-bs-theme="light" data-color-theme="Sipjaki_Theme" data-layout="vertical">
      <head>
        <HeadContent />
      </head>
      <body style={{ backgroundColor: '#f5f5fc' }}>
        {children}
        {/* <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        /> */}
        <Scripts />

        {/* <script src={landingJs} ></script> */}
        <script src={vendorJs} ></script>
        <script src={bootstrapJs} ></script>
        <script src={appInitJs} ></script>
        <script src={themeJs} ></script>
        <script src={appJs} ></script>
        <script src={jqueryJs} ></script>
        <script src={sidebarmenuJs} ></script>
        <script src="https://cdn.jsdelivr.net/npm/iconify-icon@1.0.8/dist/iconify-icon.min.js"></script>
      </body>
    </html>
  )
}
