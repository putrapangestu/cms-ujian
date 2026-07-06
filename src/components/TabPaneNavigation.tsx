import { Link } from '@tanstack/react-router'
import React from 'react'

type componentProps = {
  tabs: readonly string[] | string[]
  activeTab: string
  from: string
  paramKey?: string
}

export function TabPaneNavigation({
  tabs,
  activeTab,
  from,
  paramKey = 'tab',
}: componentProps) {
  return (
    <div className="card mb-3">
      <div className="card-body p-1">
        <div
          className="overflow-auto"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <ul
            className="nav nav-pills flex-nowrap hide-scrollbar overflow-y-hidden"
            role="tablist"
          >
            {tabs.map((t) => (
              <React.Fragment key={t}>
                <li className="nav-item flex-fill text-sm-center">
                  <Link
                    to="."
                    from={from as any}
                    search={
                      ((prev: any) => ({ ...prev, [paramKey]: t })) as any
                    }
                    className={`nav-link text-center px-2 py-1 rounded-sm ${t === activeTab ? 'bg-primary text-white' : ''}`}
                  >
                    <span className="text-capitalize text-nowrap text-center">
                      {t}
                    </span>
                  </Link>
                </li>
                {t !== tabs[tabs.length - 1] ? (
                  <span
                    className="vr"
                    style={{ background: '#eee', minWidth: '1px' }}
                  ></span>
                ) : null}
              </React.Fragment>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
