'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from '@/contexts/TranslationContext'
import { TranslationPath } from '@/locales'
import { useSession } from 'next-auth/react'
import { 
  FiHome, 
  FiPieChart, 
  FiSettings, 
  FiCalendar, 
  FiDollarSign, 
  FiMenu,
  FiX,
  FiCreditCard,
  FiInfo,
  FiHelpCircle,
  FiBarChart2,
  FiTarget,
  FiFileText,
  FiDownload,
  FiList,
  FiPlus,
  FiChevronDown,
  FiChevronRight
} from 'react-icons/fi'
import { IconType } from 'react-icons'

interface SidebarProps {
  mobile?: boolean;
}

interface SubMenuItem {
  icon: IconType;
  name: string;
  path: string;
}

interface NavItem {
  icon: IconType;
  name: string;
  path: string;
  hasSubmenu?: boolean;
  submenu?: SubMenuItem[];
}

export default function Sidebar({ mobile = false }: SidebarProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = React.useState(mobile ? true : false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [expandedMenus, setExpandedMenus] = React.useState<string[]>([])
  const { t } = useTranslation()

  // Toggle submenu expansion
  const toggleSubmenu = (name: string) => {
    setExpandedMenus(prev => 
      prev.includes(name) 
        ? prev.filter(item => item !== name) 
        : [...prev, name]
    )
  }

  // Public navigation items for unauthenticated users
  const publicNavItems: NavItem[] = [
    { icon: FiHome, name: 'Home', path: '/' },
    { icon: FiInfo, name: 'Features', path: '/#features' },
    { icon: FiHelpCircle, name: 'Help', path: '/#help' },
  ]
  
  // Navigation items for authenticated users
  const navItems: NavItem[] = [
    { icon: FiBarChart2, name: 'dashboard', path: '/dashboard' },
    { 
      icon: FiCreditCard, 
      name: 'transactions', 
      path: '/transactions',
      hasSubmenu: true,
      submenu: [
        { icon: FiList, name: 'All Transactions', path: '/transactions' },
        { icon: FiDownload, name: 'Export to Excel', path: '/transactions/export' }
      ]
    },
    { icon: FiPieChart, name: 'analytics', path: '/analytics' },
    { icon: FiCalendar, name: 'calendar', path: '/calendar' },
    { icon: FiTarget, name: 'budgetPlanning', path: '/budget-planning' },
    { icon: FiFileText, name: 'ITR Overview', path: '/itr-overview' },
    { icon: FiSettings, name: 'settings', path: '/settings' },
    { icon: FiHelpCircle, name: 'Help', path: '/help' }
  ]
  
  // Display either public or authenticated navigation items based on auth status
  const navigationItems = status === 'authenticated' ? navItems : publicNavItems

  if (mobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-[100] shadow-lg">
        <nav className="flex justify-around items-center h-16 px-2 max-w-screen-xl mx-auto">
          {navigationItems.map((item) => {
            const isActive = pathname === item.path
            const Icon = item.icon
            
            // For public items without translation keys
            const itemName = item.name.startsWith('dashboard') || 
                           item.name.startsWith('transactions') || 
                           item.name.startsWith('analytics') || 
                           item.name.startsWith('calendar') || 
                           item.name.startsWith('budgetPlanning') || 
                           item.name.startsWith('settings') ||
                           item.name === 'ITR Overview'
              ? item.name === 'ITR Overview' ? 'ITR' : t(`navigation.${item.name}` as TranslationPath)
              : item.name
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center justify-center p-2 rounded-full ${
                  isActive 
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
                aria-label={itemName}
              >
                <Icon className="h-5 w-5" />
              </Link>
            )
          })}
        </nav>
      </div>
    )
  }

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-gray-800 h-screen overflow-y-auto transition-width duration-300 flex flex-col border-r border-gray-200 dark:border-gray-700`}>
      {/* Sidebar Header with Collapse Button */}
      <div className="h-16 flex items-center justify-between px-4">
        {!isCollapsed && (
          <span className="text-gray-800 dark:text-white font-semibold">Menu</span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <FiMenu className="h-5 w-5" /> : <FiX className="h-5 w-5" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.path || 
                            (item.hasSubmenu && item.submenu?.some(subItem => pathname === subItem.path))
            const Icon = item.icon
            const isExpanded = expandedMenus.includes(item.name)
            
            // For public items without translation keys
            const itemName = item.name.startsWith('dashboard') || 
                          item.name.startsWith('transactions') || 
                          item.name.startsWith('analytics') || 
                          item.name.startsWith('calendar') || 
                          item.name.startsWith('budgetPlanning') || 
                          item.name.startsWith('settings') ||
                          item.name === 'ITR Overview'
              ? item.name === 'ITR Overview' ? 'ITR' : t(`navigation.${item.name}` as TranslationPath)
              : item.name
            
            return (
              <li key={item.path} className={item.hasSubmenu ? 'mb-1' : ''}>
                {item.hasSubmenu ? (
                  <>
                    <button
                      onClick={() => !isCollapsed && toggleSubmenu(item.name)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium ${
                        isActive 
                          ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon className="h-5 w-5 mr-3" />
                        {!isCollapsed && <span>{itemName}</span>}
                      </div>
                      {!isCollapsed && (
                        isExpanded ? 
                          <FiChevronDown className="h-4 w-4" /> : 
                          <FiChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    
                    {!isCollapsed && isExpanded && item.submenu && (
                      <ul className="mt-1 pl-10 space-y-1">
                        {item.submenu.map(subItem => {
                          const SubIcon = subItem.icon
                          const isSubActive = pathname === subItem.path
                          
                          return (
                            <li key={subItem.path}>
                              <Link
                                href={subItem.path}
                                className={`flex items-center px-3 py-2 rounded-md text-sm ${
                                  isSubActive 
                                    ? 'text-blue-600 dark:text-blue-400 font-medium'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                                }`}
                              >
                                <SubIcon className="h-4 w-4 mr-2" />
                                <span>{subItem.name}</span>
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.path}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      isActive 
                        ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                    aria-label={itemName}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {!isCollapsed && <span>{itemName}</span>}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
      
      {/* Show promotional content for unauthenticated users */}
      {status === 'unauthenticated' && !mobile && !isCollapsed && (
        <div className="mt-10 mx-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Ready to get started?</h3>
          <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
            Create an account to start tracking your expenses and managing your finances.
          </p>
          <div className="mt-3">
            <Link 
              href="/auth/signup"
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
            >
              Sign up for free →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
} 