'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { FiChevronDown, FiChevronUp, FiMail, FiMessageCircle, FiHelpCircle, FiBook, FiFileText, FiBarChart2, FiCreditCard, FiPieChart, FiCalendar, FiTarget } from 'react-icons/fi'
import { useTranslation } from '@/contexts/TranslationContext'

interface FAQItemProps {
  question: string;
  answer: string;
}

// Guide item component for collapsible guides
const GuideItem = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg mb-4">
      <button
        className="flex justify-between items-center w-full py-4 px-4 text-left focus:outline-none bg-gray-50 dark:bg-gray-800/50 rounded-t-lg"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen ? "true" : "false"}
      >
        <div className="flex items-center">
          <div className="mr-3 text-blue-600 dark:text-blue-400">
            {icon}
          </div>
          <span className="font-medium text-gray-900 dark:text-white">{title}</span>
        </div>
        <span>
          {isOpen ? (
            <FiChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <FiChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          )}
        </span>
      </button>
      {isOpen && (
        <div className="p-4 bg-white dark:bg-gray-800">
          {children}
        </div>
      )}
    </div>
  )
}

// FAQ component with toggle functionality
const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <button
        className="flex justify-between items-center w-full py-4 px-2 text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen ? "true" : "false"}
      >
        <span className="font-medium text-gray-900 dark:text-white">{question}</span>
        <span className="ml-6 flex-shrink-0">
          {isOpen ? (
            <FiChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <FiChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          )}
        </span>
      </button>
      {isOpen && (
        <div className="pb-4 px-2">
          <p className="text-gray-600 dark:text-gray-300">{answer}</p>
        </div>
      )}
    </div>
  )
}

export default function HelpPage() {
  const { data: session, status } = useSession()
  const { t } = useTranslation()
  
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-medium text-gray-900 dark:text-white">{t('common.loading')}</p>
      </div>
    )
  }
  
  const faqs = [
    { 
      question: t('help.faqs.q1' as any), 
      answer: t('help.faqs.a1' as any) 
    },
    { 
      question: t('help.faqs.q2' as any), 
      answer: t('help.faqs.a2' as any) 
    },
    { 
      question: t('help.faqs.q3' as any), 
      answer: t('help.faqs.a3' as any) 
    },
    { 
      question: t('help.faqs.q4' as any), 
      answer: t('help.faqs.a4' as any) 
    },
    { 
      question: t('help.faqs.q5' as any), 
      answer: t('help.faqs.a5' as any) 
    },
  ]
  
  return (
    <div className="container-responsive section-padding">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <FiHelpCircle className="h-7 w-7" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('help.title' as any)}</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{t('help.description' as any)}</p>
      </div>
      
      <div className="mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">User Guides</h2>
          
          <GuideItem 
            title="Getting Started with Expenso" 
            icon={<FiBook className="h-5 w-5" />}
          >
            <ol className="space-y-4 list-decimal pl-5">
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-gray-100">Create an account:</span> Start by signing up with your email address and creating a secure password.
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-gray-100">Set up your profile:</span> Add your personal details and preferences in the Settings page.
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-gray-100">Customize settings:</span> Select your preferred currency and date format in the Settings menu.
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-gray-100">Explore the dashboard:</span> Familiarize yourself with the main overview that shows your financial summary.
              </li>
            </ol>
          </GuideItem>
          
          <GuideItem 
            title="Managing Transactions" 
            icon={<FiCreditCard className="h-5 w-5" />}
          >
            <ol className="space-y-4 list-decimal pl-5">
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-gray-100">Add a transaction:</span> Click on "Transactions" in the sidebar, then click the "Add Transaction" button.
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-gray-100">Fill in details:</span> Enter the amount, select the type (income or expense), choose a category, and add the date.
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-gray-100">Edit a transaction:</span> Click on the edit icon next to any transaction to modify its details.
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-gray-100">Delete a transaction:</span> Click on the delete icon and confirm to remove a transaction.
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-gray-100">Filter transactions:</span> Use the filter options to view specific transaction types or categories.
              </li>
            </ol>
          </GuideItem>
          
          <GuideItem 
            title="Using Analytics" 
            icon={<FiPieChart className="h-5 w-5" />}
          >
            <ol className="space-y-4 list-decimal pl-5">
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-gray-100">Access analytics:</span> Click on "Analytics" in the sidebar to view your financial reports.
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-gray-100">Explore charts:</span> View income vs. expense breakdowns, category distributions, and spending trends.
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-gray-100">Change time periods:</span> Select different time ranges (weekly, monthly, yearly) to analyze your finances.
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-gray-100">Identify trends:</span> Use the insights to understand your spending patterns and make informed decisions.
              </li>
            </ol>
          </GuideItem>
          
          <GuideItem 
            title="Creating and Managing Budgets" 
            icon={<FiTarget className="h-5 w-5" />}
          >
            <ol className="space-y-4 list-decimal pl-5">
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-gray-100">Create a budget:</span> Navigate to "Budget Planning" and click "Create Budget".
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-gray-100">Set budget details:</span> Enter a name, select a period (monthly/yearly), and set spending limits for each category.
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-gray-100">Track progress:</span> Monitor your budget progress as you add transactions throughout the period.
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-gray-100">Edit budgets:</span> Adjust your budget amounts or categories by clicking "Edit" on any existing budget.
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-gray-100">Budget alerts:</span> Receive notifications when you're approaching or exceeding your budget limits.
              </li>
            </ol>
          </GuideItem>
          
          <GuideItem 
            title="Using the Calendar View" 
            icon={<FiCalendar className="h-5 w-5" />}
          >
            <ol className="space-y-4 list-decimal pl-5">
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-gray-100">Access calendar:</span> Click on "Calendar" in the sidebar to view your transactions by date.
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-gray-100">Navigate dates:</span> Use the month and year selectors to change the time period.
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-gray-100">View daily transactions:</span> Click on any date to see all transactions for that specific day.
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-gray-100">Add transactions:</span> Quickly add new transactions for specific dates from the calendar view.
              </li>
            </ol>
          </GuideItem>
          
          <GuideItem 
            title="ITR Overview Tools" 
            icon={<FiFileText className="h-5 w-5" />}
          >
            <ol className="space-y-4 list-decimal pl-5">
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-gray-100">Access ITR tools:</span> Click on "ITR Overview" in the sidebar menu.
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-gray-100">Input your income:</span> Enter your salary, business income, and other income sources in the respective fields.
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-gray-100">Add deductions:</span> Enter all your eligible deductions under various sections like 80C, 80D, etc.
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-gray-100">Compare tax regimes:</span> View and compare tax calculations under both Old and New tax regimes.
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-gray-100">Review tax summary:</span> Analyze the detailed breakdown of your tax calculation and potential savings.
              </li>
            </ol>
          </GuideItem>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('help.faqTitle' as any)}</h2>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
        <div className="md:flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('help.contactTitle' as any)}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{t('help.contactDescription' as any)}</p>
            <div className="flex items-center mt-3">
              <FiMail className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <span className="text-gray-800 dark:text-gray-200 font-medium">
                Contact the developer: princeshah.23.cse@iite.indusuni.ac.in
              </span>
            </div>
            <div className="flex items-center mt-2">
              <FiMail className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <span className="text-gray-800 dark:text-gray-200 font-medium">
                Contact the developer: digantmalviya.23.cse@iite.indusuni.ac.in
              </span>
            </div>
            <div className="flex items-center mt-2">
              <FiMail className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <span className="text-gray-800 dark:text-gray-200 font-medium">
                Contact the developer: premladani.23.it@iite.indusuni.ac.in
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 