import React from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, children }) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
      {description && (
        <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-3xl">{description}</p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}

export default PageHeader 