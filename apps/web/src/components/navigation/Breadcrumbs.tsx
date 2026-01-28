'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd'

interface BreadcrumbItem {
  label: string
  href: string
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const paths = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' }
  ]

  let currentPath = ''
  paths.forEach((path) => {
    currentPath += `/${path}`
    
    // Format label: capitalize and replace hyphens with spaces
    const label = path
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    breadcrumbs.push({
      label,
      href: currentPath
    })
  })

  return breadcrumbs
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const breadcrumbs = generateBreadcrumbs(pathname)

  // Don't show breadcrumbs on home page
  if (pathname === '/') return null

  const jsonLdItems = breadcrumbs.map(item => ({
    name: item.label,
    item: `https://mythosatlas.com${item.href}`
  }))

  return (
    <>
      <BreadcrumbJsonLd items={jsonLdItems} />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1
            
            return (
              <li key={crumb.href} className="flex items-center gap-2">
                {index === 0 && <Home className="h-4 w-4" />}
                
                {isLast ? (
                  <span className="font-medium text-slate-900 dark:text-slate-100" aria-current="page">
                    {crumb.label}
                  </span>
                ) : (
                  <>
                    <Link
                      href={crumb.href}
                      className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
