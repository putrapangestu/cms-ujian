import {
  HeadContent,
  Scripts,
  createRootRoute,
  useMatches,
} from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuthStore } from '@/data/store/auth_store'
import { apiClient } from '@/lib/api-client'
import { AUTH } from '@/data/const/api_url'
import { useGlobalStore } from '@/data/store/global_store'
import '@/lib/global-settings'

// Bootstrap CSS
import appCss from '@/assets/css/styles.css?url'
import customCss from '@/assets/css/custom.css?url'
import stylesCss from '@/styles.css?url'

// Bootstrap JS
import vendorJs from '@/assets/js/vendor.min.js?url'
import bootstrapJs from '@/assets/dependencies/bootstrap/js/bootstrap.min.js?url'
import appInitJs from '@/assets/js/theme/app.init.js?url'
import themeJs from '@/assets/js/theme/theme.js?url'
import appJs from '@/assets/js/theme/app.min.js?url'
import sidebarmenuJs from '@/assets/js/theme/sidebarmenu.js?url'
import { NotFoundComponent } from '@/components/NotFound'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: import.meta.env.VITE_APP_NAME },
    ],
  }),
  notFoundComponent: () => <NotFoundComponent />,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const matches = useMatches()
  const { login, logout, isFetched, setIsFetched } = useAuthStore()
  const setIsMounted = useGlobalStore((state) => state.setIsMounted)

  const isLandingPage = matches.some(
    (match) =>
      match.id === '/_public' ||
      match.id === '/landing' ||
      match.id.includes('_public'),
  )

  useEffect(() => {
    setIsMounted(true)
    const fetchAuth = async () => {
      try {
        const userData = await apiClient.get(AUTH.ME)
        login(userData.data.data)
      } catch (e) {
        if (import.meta.env.DEV) {
          console.error('Session restore failed:', e)
        }
        logout()
      }
      setIsFetched(true)
    }

    if (!isFetched) fetchAuth()
  }, [isFetched])

  useEffect(() => {
    const handleImageError = (event: Event) => {
      const img = event.target as HTMLImageElement
      if (img.tagName === 'IMG') {
        if (img.classList.contains('leaflet-tile')) return
        const fallbackUrl = '/not-found-img.png'
        if (img.src !== window.location.origin + fallbackUrl) {
          img.src = fallbackUrl
          img.classList.add('img-error-fallback')
        }
      }
    }

    window.addEventListener('error', handleImageError, true)
    return () => window.removeEventListener('error', handleImageError, true)
  }, [])

  return (
    <html
      lang="en"
      dir="ltr"
      data-bs-theme="light"
      data-color-theme="Sipjaki_Theme"
      data-layout="vertical"
    >
      <head>
        <HeadContent />

        {/* ✅ Conditional CSS Loading */}
        {isLandingPage ? (
          // Load Tailwind for landing page
          <link rel="stylesheet" href={stylesCss} />
        ) : (
          // Load Bootstrap for other pages
          <>
            <link rel="stylesheet" href={appCss} />
            <link rel="stylesheet" href={customCss} />
          </>
        )}
      </head>
      <body
        style={{ backgroundColor: isLandingPage ? 'transparent' : '#f5f5fc' }}
      >
        {children}
        <Scripts />

        {/* ✅ Load Bootstrap JS only for non-landing pages */}
        {!isLandingPage && (
          <>
            <script src={vendorJs} defer></script>
            <script src={bootstrapJs} defer></script>
            <script src={appInitJs} defer></script>
            <script src={themeJs} defer></script>
            <script src={appJs} defer></script>
            <script src={sidebarmenuJs} defer></script>
          </>
        )}

        <script
          src="https://cdn.jsdelivr.net/npm/iconify-icon@1.0.8/dist/iconify-icon.min.js"
          defer
        ></script>
      </body>
    </html>
  )
}
