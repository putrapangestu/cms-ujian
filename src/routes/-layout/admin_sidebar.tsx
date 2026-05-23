import { SIDEBAR_ADMIN_ITEMS } from '@/data/const/sidebar_admin_item'
import { useAuthStore } from '@/data/store/auth_store'
import type { SidebarItemType } from '@/data/types/sidebar_admin'
import { hasPermission } from '@/lib/permission-helper'
// import { hasPermission } from "@/lib/permission-helper";
import { IconCircle, IconLogout, type Icon } from '@tabler/icons-react'
import { Link, useLocation } from '@tanstack/react-router'
import { Fragment, useEffect, useState } from 'react'
import SimpleBar from 'simplebar-react'

export default function AdminSidebar() {
  const { user } = useAuthStore()

  return (
    <aside className="left-sidebar with-vertical">
      <div>
        <div className="brand-logo d-flex align-items-center justify-content-between">
          <Link to="/admin" className="text-nowrap logo-img">
            <div className="dark-logo d-flex gap-3 align-items-center">
              {/* <img src="/logo-name.png" alt="Logo-Dark" height={35} /> */}
              <h3 className="fw-bolder">BIMBEL AN</h3>
            </div>
          </Link>
          <a
            href="javascript:void(0)"
            className="ms-auto text-decoration-none fs-5 d-block d-xl-none"
            style={{ color: 'var(--bs-dark-text-emphasis)' }}
            onClick={(e) => {
              e.preventDefault()
              const wrapper = document.getElementById('main-wrapper')
              if (wrapper) wrapper.classList.remove('show-sidebar')
            }}
          >
            <i className="ti ti-x"></i>
          </a>
        </div>

        <SimpleBar
          className="sidebar-nav scroll-sidebar"
          style={{ height: 'calc(100vh - 175px)' }}
        >
          <ul id="sidebarnav">
            {SIDEBAR_ADMIN_ITEMS.map((section, index) => (
              <Fragment key={index}>
                <HeaderItem label={section.label} />
                {section.children.map((item, index) => (
                  <NavItem key={index} item={item} level={0} />
                ))}
              </Fragment>
            ))}
          </ul>
        </SimpleBar>
        <div className="fixed-profile p-3 mx-4 rounded mt-3">
          <div className="hstack gap-3">
            <div className="john-img">
              <img
                src="/profile/user-1.jpg"
                className="rounded-circle"
                width="40"
                height="40"
                alt="modernize-img"
              />
            </div>
            <div className="john-title" style={{ minWidth: 0 }}>
              <h6 className="mb-0 fs-2 fw-semibold text-truncate">
                {user?.name}
              </h6>
              <span className="fs-2 d-block text-truncate" title={user?.email}>
                {user?.email}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

function HeaderItem({ label }: { label: string }) {
  return (
    <li className="nav-small-cap">
      <i className="ti ti-dots nav-small-cap-icon fs-4"></i>
      <span className="hide-menu">{label}</span>
    </li>
  )
}

type NavItemProps =
  | {
      item: SidebarItemType & { icon: Icon; children?: SidebarItemType[] }
      level: 0
    }
  | {
      item: SidebarItemType
      level: 1
    }

const NavItem = ({ item, level }: NavItemProps) => {
  const userRole = useAuthStore((state) => state.roles)
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const checkActive = (
    currentItem: SidebarItemType & { children?: SidebarItemType[] },
  ): boolean => {
    if (currentItem.url === location.pathname) return true
    if (currentItem.children) {
      return currentItem.children.some((child) => checkActive(child))
    }
    return false
  }

  const isSelfOrChildActive = checkActive(item)
  const isDirectActive = item.url === location.pathname

  // Auto expand jika anak sedang aktif
  useEffect(() => {
    if (isSelfOrChildActive) setIsOpen(true)
  }, [isSelfOrChildActive])

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsOpen(!isOpen)
  }

  const renderIcon = () => {
    if (level === 0 && item.icon) {
      const Icon = item.icon
      return <Icon size={20} className="sidebar-icon" />
    }

    return (
      <div className="round-16 d-flex align-items-center justify-content-center">
        <IconCircle size={8} fill="currentColor" />
      </div>
    )
  }

  if (!hasPermission(userRole, item.hasAccess)) return null

  if (level === 0 && item.children && item.children.length > 0) {
    return (
      <li className="sidebar-item">
        <a
          className={`sidebar-link has-arrow ${isSelfOrChildActive || isOpen ? 'active' : ''}`}
          href="#"
          onClick={handleToggle}
          aria-expanded={isOpen}
        >
          <span className="d-flex align-items-center">{renderIcon()}</span>
          <span className="hide-menu">{item.label}</span>
        </a>

        <ul
          aria-expanded={isOpen}
          className={`first-level ${isOpen ? 'in show' : 'collapse'}`}
        >
          {item.children.map((child, index) => {
            return <NavItem key={index} item={child} level={1} />
          })}
        </ul>
      </li>
    )
  }

  return (
    <li className="sidebar-item">
      <Link
        className={`sidebar-link ${isDirectActive ? 'active' : ''}`}
        to={item.url}
        aria-expanded="false"
      >
        <span className="d-flex align-items-center">{renderIcon()}</span>
        <span className="hide-menu">{item.label}</span>
      </Link>
    </li>
  )
}