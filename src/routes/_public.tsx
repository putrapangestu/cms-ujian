import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useEffect } from 'react'

import homeCss from "@/assets/css/home.css?url"
import homeHeaderCss from "@/assets/css/home-header.css?url"
import wowCss from "@/assets/dependencies/wow/css/animate.css?url"

import parallaxUrl from "@/assets/dependencies/jquery.parallax-scroll/js/jquery.parallax-scroll.js?url"
import headerUrl from "@/assets/dependencies/header.js?url"
import PublicHeader from './-layout/public_header'
import PublicFooter from './-layout/public_footer'

export const Route = createFileRoute('/_public')({
    component: RouteComponent,
})

function RouteComponent() {
    
    useEffect(() => {
        const loadScript = (src: string) => {
            return new Promise((resolve, reject) => {
                if (document.querySelector(`script[src="${src}"]`)) {
                resolve(true);
                return;
                }
                
                const script = document.createElement('script');
                script.src = src;
                script.async = false; // PENTING: false agar urutan load sesuai (jQuery dulu, baru plugin)
                script.onload = () => resolve(true);
                script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
                document.body.appendChild(script);
            });
        };
        const initScripts = async () => {
            if (typeof window !== 'undefined') {
                try {
                    await loadScript(parallaxUrl);
                    await loadScript(headerUrl);
                } catch (error) {
                    console.error("Script loading error:", error);
                }
            }
        };
        initScripts();
    }, [])

  return (
    <>
        <div id="main_content">
            <PublicHeader />

            <Outlet />
            
            <PublicFooter />
        </div>
        <link rel="stylesheet" href={homeCss} />
        <link rel="stylesheet" href={homeHeaderCss} />
        <link rel="stylesheet" href={wowCss} />
        <style>{`
            .mask-overlay {
                display: none !important;
            }
        `}</style>
    </>
  )
}
