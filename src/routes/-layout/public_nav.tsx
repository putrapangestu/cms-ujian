import { navLinks } from '@/data/const/nav_public_items'
import type { NoChildNavItemType } from '@/data/types/nav_public'
import { Link, useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'

export default function PublicNav() {
  const location = useLocation()

  const isParentActive = (children?: NoChildNavItemType[]) => {
    if (!children) return false
    return children.some((child) => location.pathname.startsWith(child.url))
  }

  // Function to close mobile menu
  const closeMobileMenu = () => {
    const html = document.querySelector('html')
    const maskOverlay = document.querySelector('.mask-overlay')

    if (html) {
      html.classList.remove('no-scroll', 'sidebar-open')
      html.style.height = 'auto'
    }

    if (maskOverlay) {
      maskOverlay.remove()
    }
  }

  useEffect(() => {
    closeMobileMenu()
  }, [location.pathname])

  // Handle link click
  const handleLinkClick = () => {
    closeMobileMenu()
  }

  return (
    <ul className="site-main-menu">
      {navLinks.map((item, index) => {
        if ('children' in item && item.children.length > 0) {
          const isActive = isParentActive(item.children)

          return (
            <li className="menu-item-has-children" key={index}>
              <a
                href="#"
                className={`d-flex d-row ${isActive ? 'active' : ''}`}
                onClick={(e) => e.preventDefault()}
              >
                {item.name}
              </a>
              <ul className="sub-menu">
                {item.children.map((child, childIndex) => (
                  <li key={childIndex}>
                    <Link
                      to={child.url}
                      activeProps={{ className: 'active' }}
                      onClick={handleLinkClick}
                    >
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          )
        }

        return (
          <li key={index}>
            <Link
              to={'url' in item ? item.url : '#'}
              activeProps={{ className: 'active' }}
              onClick={handleLinkClick}
            >
              {item.name}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
