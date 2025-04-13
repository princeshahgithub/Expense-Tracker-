'use client'

import React, { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  FiBarChart2, 
  FiPieChart, 
  FiDollarSign, 
  FiCalendar, 
  FiTarget, 
  FiCreditCard,
  FiArrowRight,
  FiTrendingUp,
  FiShield,
  FiMoon,
  FiSmartphone,
  FiFileText
} from 'react-icons/fi'
import Image from 'next/image'

export default function HomePage() {
  const { status } = useSession()
  const router = useRouter()
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])
  
  // Show loading state while checking auth
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  // Only render the homepage if not authenticated
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section with animated gradient background */}
      <div className="relative overflow-hidden pb-10 sm:pb-0">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
          <div className="absolute inset-0 opacity-50 dark:opacity-30 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.3),transparent),radial-gradient(circle_at_70%_60%,rgba(139,92,246,0.3),transparent)]"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 sm:py-16 md:py-20 lg:py-28">
            <div className="text-center">
              <div className="inline-block animate-bounce-slow mb-4">
                <div className="flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-blue-100 dark:bg-blue-900/50 mx-auto">
                  <Image
                    src="/android-chrome-192x192.png"
                    alt="Expenso Logo"
                    width={48}
                    height={48}
                    className="h-8 w-8 sm:h-10 sm:w-10"
                    priority
                  />
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
                <span className="block">Welcome to</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Expenso</span>
              </h1>
              <div className="mt-3 mb-4 inline-block">
                <p className="px-4 py-1.5 text-base sm:text-lg font-bold italic text-white bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-500 dark:to-blue-500 rounded-full shadow-md transform hover:scale-105 transition-transform duration-300">
                  Hated by other trackers, defeated by none — built different.
                </p>
              </div>
              <p className="mt-4 sm:mt-5 max-w-xl mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:text-xl px-6 sm:px-0">
                Take control of your finances with intelligent expense tracking, budget planning, and powerful analytics all in one place.
              </p>
              <div className="mt-6 sm:mt-8 px-4 sm:px-0 max-w-md mx-auto sm:flex sm:justify-center md:mt-10">
                <div className="w-full sm:w-auto rounded-md shadow mb-4 sm:mb-0">
                  <Link
                    href="/auth/signup"
                    className="w-full flex items-center justify-center px-6 sm:px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 md:py-4 md:text-lg md:px-10 transition-all duration-300"
                  >
                    Get started for free
                  </Link>
                </div>
                <div className="w-full sm:w-auto rounded-md shadow sm:mt-0 sm:ml-3">
                  <Link
                    href="/auth/signin"
                    className="w-full flex items-center justify-center px-6 sm:px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 dark:text-blue-400 dark:bg-gray-800 dark:hover:bg-gray-700 md:py-4 md:text-lg md:px-10 transition-all duration-300"
                  >
                    Log in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dashboard Preview - New Design */}
      <div className="py-12 sm:py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-3">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Smart Money Management</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl px-2">
              Modern, intuitive financial dashboard
            </h2>
            <p className="mt-3 sm:mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-gray-500 dark:text-gray-400 px-4 sm:px-0">
              Access your finances anywhere, on any device with our responsive design
            </p>
          </div>

          <div className="relative">
            {/* Device mockups */}
            <div className="flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-8">
              {/* Desktop mockup */}
              <div className="relative w-full max-w-4xl overflow-hidden">
                <div className="relative rounded-xl shadow-2xl">
                  {/* Desktop frame */}
                  <div className="aspect-[16/9] bg-[#111927] p-2 sm:p-5 pt-6 sm:pt-8 rounded-xl relative">
                    {/* Window control dots */}
                    <div className="absolute top-1.5 sm:top-2.5 left-2 sm:left-5 flex space-x-1 sm:space-x-1.5">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                    </div>
                    
                    {/* Dashboard content - hide details on smallest screens */}
                    <div className="h-full rounded-lg overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
                      {/* App header */}
                      <div className="h-8 sm:h-14 bg-slate-800 border-b border-slate-700 px-2 sm:px-6 flex items-center justify-between">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                          <div className="flex items-center">
                            <Image
                              src="/android-chrome-192x192.png"
                              alt="Expenso Logo"
                              width={28}
                              height={28}
                              className="mr-1 sm:mr-2 h-5 w-5 sm:h-7 sm:w-7"
                            />
                            <span className="text-blue-500 font-bold text-sm sm:text-xl">Expenso</span>
                          </div>
                          <div className="hidden md:flex space-x-1">
                            {['Overview', 'Transactions', 'Budgets', 'Reports'].map((item, i) => (
                              <button key={i} className={`px-3 py-1 text-sm rounded ${i === 0 ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <button 
                            className="p-1 sm:p-1.5 rounded-full bg-slate-700 text-slate-400 hover:text-white"
                            aria-label="Toggle dark mode"
                            title="Toggle dark mode"
                          >
                            <FiMoon className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                          <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs sm:font-medium">
                            P
                          </div>
                        </div>
                      </div>
                      
                      {/* Main content area - simplify on mobile */}
                      <div className="hidden xs:grid grid-cols-12 gap-2 sm:gap-5 p-2 sm:p-5 h-[calc(100%-3.5rem)]">
                        {/* Left column */}
                        <div className="col-span-8 flex flex-col gap-5">
                          {/* Welcome and stats section */}
                          <div className="grid grid-cols-4 gap-4">
                            <div className="col-span-4">
                              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 flex justify-between items-center">
                                <div>
                                  <h2 className="text-lg font-semibold text-white">Welcome back, PRINCE</h2>
                                  <p className="text-blue-100 text-sm mt-1">Your financial summary is looking great today</p>
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
                                  <span className="text-xs font-medium">Balance</span>
                                  <div className="text-lg font-bold">₹28,270.00</div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Stat boxes */}
                            {[
                              { label: 'Income', value: '₹35,000', percent: '+12%', isUp: true },
                              { label: 'Expenses', value: '₹10,130', percent: '-8%', isUp: false },
                              { label: 'Savings', value: '₹24,870', percent: '+24%', isUp: true },
                              { label: 'Investments', value: '₹15,500', percent: '+5%', isUp: true }
                            ].map((stat, i) => (
                              <div key={i} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                                <div className="flex justify-between items-start mb-3">
                                  <span className="text-gray-400 text-xs">{stat.label}</span>
                                  <span className={`text-xs px-1.5 py-0.5 rounded ${stat.isUp ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                                    {stat.percent}
                                  </span>
                                </div>
                                <div className="text-white font-bold text-xl">{stat.value}</div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Charts section */}
                          <div className="flex gap-4 flex-grow">
                            <div className="flex-1 bg-slate-800 rounded-xl p-4 border border-slate-700">
                              <div className="flex justify-between items-center mb-4">
                                <h3 className="text-white font-semibold">Monthly Overview</h3>
                                <div className="flex space-x-1 bg-slate-700/50 rounded-lg p-1">
                                  {['1M', '3M', '6M', '1Y'].map((period, i) => (
                                    <button key={i} className={`px-2 py-0.5 rounded text-xs ${i === 0 ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>
                                      {period}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Chart */}
                              <div className="h-[200px] mt-4 flex items-end">
                                <div className="w-full flex items-end justify-between gap-1 px-2">
                                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((month, i) => {
                                    const inHeight = [60, 45, 80, 65, 75, 90, 70][i];
                                    const exHeight = [30, 60, 45, 40, 50, 35, 45][i];
                                    
                                    return (
                                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                        <div className="w-full flex gap-1 justify-center">
                                          <div className="w-[45%] bg-blue-500 rounded-t" style={{ height: `${inHeight}%` }}></div>
                                          <div className="w-[45%] bg-red-400 rounded-t" style={{ height: `${exHeight}%` }}></div>
                                        </div>
                                        <div className="text-gray-500 text-xs mt-2">{month}</div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                              
                              <div className="flex justify-center space-x-6 mt-2">
                                <div className="flex items-center">
                                  <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                                  <span className="text-gray-400 text-xs">Income</span>
                                </div>
                                <div className="flex items-center">
                                  <div className="w-3 h-3 bg-red-400 rounded mr-2"></div>
                                  <span className="text-gray-400 text-xs">Expenses</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="w-[40%] bg-slate-800 rounded-xl p-4 border border-slate-700">
                              <div className="flex justify-between items-center mb-4">
                                <h3 className="text-white font-semibold">Spending Categories</h3>
                                <button className="text-blue-400 text-xs">View All</button>
                              </div>
                              
                              {/* Donut chart */}
                              <div className="flex items-center justify-center h-[150px] mt-2 relative">
                                <div className="w-28 h-28 rounded-full border-[6px] border-indigo-500 absolute"></div>
                                <div className="w-28 h-28 rounded-full border-t-[6px] border-r-[6px] border-transparent border-b-[6px] border-l-[6px] border-green-400 absolute"></div>
                                <div className="w-28 h-28 rounded-full border-t-[6px] border-transparent border-r-[6px] border-b-[6px] border-l-[6px] border-transparent absolute" style={{transform: 'rotate(135deg)'}}></div>
                                <div className="w-28 h-28 rounded-full border-t-[6px] border-transparent border-r-[6px] border-yellow-400 border-b-[6px] border-yellow-400 border-l-[6px] border-transparent absolute" style={{transform: 'rotate(225deg)'}}></div>
                                <div className="w-28 h-28 rounded-full border-t-[6px] border-red-400 border-r-[6px] border-transparent border-b-[6px] border-transparent border-l-[6px] border-transparent absolute" style={{transform: 'rotate(315deg)'}}></div>
                                <div className="bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center z-10">
                                  <div className="text-center">
                                    <div className="text-sm text-gray-400">Total</div>
                                    <div className="text-white font-bold">₹10,130</div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-2 mt-4">
                                {[
                                  { color: 'bg-indigo-500', label: 'Housing', amount: '50%' },
                                  { color: 'bg-green-400', label: 'Food', amount: '15%' },
                                  { color: 'bg-yellow-400', label: 'Transport', amount: '20%' },
                                  { color: 'bg-red-400', label: 'Entertainment', amount: '15%' }
                                ].map((cat, i) => (
                                  <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <div className={`w-2 h-2 rounded-full ${cat.color} mr-2`}></div>
                                      <span className="text-gray-400 text-xs">{cat.label}</span>
                                    </div>
                                    <span className="text-white text-xs">{cat.amount}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Right column */}
                        <div className="col-span-4 flex flex-col gap-5">
                          {/* Quick actions */}
                          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                            <h3 className="text-white font-semibold mb-3">Quick Actions</h3>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { icon: <FiDollarSign className="h-5 w-5" />, label: 'Add Income' },
                                { icon: <FiCreditCard className="h-5 w-5" />, label: 'Add Expense' },
                                { icon: <FiTarget className="h-5 w-5" />, label: 'New Budget' }
                              ].map((action, i) => (
                                <button key={i} className="bg-slate-700 rounded-lg p-3 hover:bg-slate-600 transition-colors flex flex-col items-center gap-1">
                                  <div className="text-blue-400">{action.icon}</div>
                                  <span className="text-white text-xs">{action.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          {/* Recent transactions */}
                          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex-grow">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-white font-semibold">Recent Transactions</h3>
                              <button className="text-blue-400 text-xs">View All</button>
                            </div>
                            
                            <div className="space-y-3 pr-1 overflow-auto max-h-[290px] custom-scrollbar">
                              {[
                                { icon: '🍔', name: 'Milk Shake', category: 'Food', date: '04/12', amount: '-₹80.00', type: 'expense' },
                                { icon: '🥤', name: 'Sugarcane Juice', category: 'Food', date: '04/12', amount: '-₹20.00', type: 'expense' },
                                { icon: '🏠', name: 'Rent', category: 'Utilities', date: '04/12', amount: '-₹10,000.00', type: 'expense' },
                                { icon: '💰', name: 'Salary', category: 'Income', date: '01/12', amount: '+₹35,000.00', type: 'income' },
                                { icon: '📱', name: 'Phone Bill', category: 'Utilities', date: '03/12', amount: '-₹499.00', type: 'expense' }
                              ].map((tx, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center mr-3">
                                      <span className="text-xs">{tx.icon}</span>
                                    </div>
                                    <div>
                                      <div className="text-white text-sm font-medium">{tx.name}</div>
                                      <div className="text-gray-500 text-xs">{tx.category} • {tx.date}</div>
                                    </div>
                                  </div>
                                  <div className={`${tx.type === 'income' ? 'text-green-400' : 'text-red-400'} font-medium text-sm`}>
                                    {tx.amount}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Desktop shadow/reflection effect */}
                <div className="h-3 bg-gradient-to-t from-transparent to-gray-900/10 dark:to-black/20 mx-6 rounded-b-full"></div>
              </div>
              
              {/* Mobile mockup - visible on large screens, hidden on smaller ones */}
              <div className="hidden lg:block relative transform -rotate-6 scale-90">
                <div className="w-[280px] h-[560px] bg-gray-900 rounded-[3rem] p-3 shadow-xl border-4 border-gray-800">
                  <div className="w-32 h-6 bg-gray-800 rounded-full absolute left-1/2 -translate-x-1/2 top-3"></div>
                  <div className="w-full h-full bg-[#111927] rounded-[2.2rem] overflow-hidden">
                    {/* Mobile header */}
                    <div className="h-14 bg-slate-800 border-b border-slate-700 px-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex items-center">
                          <Image
                            src="/android-chrome-192x192.png"
                            alt="Expenso Logo"
                            width={20}
                            height={20}
                            className="mr-2 h-5 w-5"
                          />
                          <span className="text-blue-500 font-bold text-lg">Expenso</span>
                        </div>
                      </div>
                      <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
                        P
                      </div>
                    </div>
                    
                    {/* Mobile content */}
                    <div className="p-3">
                      {/* Balance card */}
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 mb-3">
                        <div className="text-blue-100 text-xs">Total Balance</div>
                        <div className="text-white font-bold text-2xl mt-1">₹28,270.00</div>
                        <div className="flex justify-between mt-4">
                          <div>
                            <div className="text-blue-100 text-xs">Income</div>
                            <div className="text-white text-sm">₹35,000</div>
                          </div>
                          <div>
                            <div className="text-blue-100 text-xs">Expenses</div>
                            <div className="text-white text-sm">₹10,130</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Quick actions */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {[
                          { icon: <FiDollarSign className="h-4 w-4" />, label: 'Income' },
                          { icon: <FiCreditCard className="h-4 w-4" />, label: 'Expense' },
                          { icon: <FiTarget className="h-4 w-4" />, label: 'Budget' }
                        ].map((action, i) => (
                          <button key={i} className="bg-slate-800 rounded-lg py-2 flex flex-col items-center gap-1">
                            <div className="text-blue-400">{action.icon}</div>
                            <span className="text-white text-xs">{action.label}</span>
                          </button>
                        ))}
                      </div>
                      
                      {/* Transactions */}
                      <div className="bg-slate-800 rounded-xl p-3">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-white text-sm font-medium">Recent Transactions</h3>
                          <button className="text-blue-400 text-xs">All</button>
                        </div>
                        
                        <div className="space-y-3">
                          {[
                            { icon: '🍔', name: 'Milk Shake', amount: '-₹80.00', type: 'expense' },
                            { icon: '🥤', name: 'Sugarcane Juice', amount: '-₹20.00', type: 'expense' },
                            { icon: '🏠', name: 'Rent', amount: '-₹10,000.00', type: 'expense' }
                          ].map((tx, i) => (
                            <div key={i} className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center mr-2">
                                  <span className="text-xs">{tx.icon}</span>
                                </div>
                                <div className="text-white text-xs">{tx.name}</div>
                              </div>
                              <div className={`${tx.type === 'income' ? 'text-green-400' : 'text-red-400'} text-xs`}>
                                {tx.amount}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Mobile navigation */}
                    <div className="absolute bottom-0 left-0 right-0 h-14 bg-slate-800 border-t border-slate-700 flex justify-around items-center px-3">
                      {['home', 'stats', 'wallet', 'profile'].map((item, i) => (
                        <button key={i} className={`p-1.5 rounded-full ${i === 0 ? 'text-blue-500' : 'text-gray-500'}`} aria-label={item}>
                          <div className="w-5 h-5">
                            {i === 0 && <FiBarChart2 className="w-full h-full" />}
                            {i === 1 && <FiPieChart className="w-full h-full" />}
                            {i === 2 && <FiDollarSign className="w-full h-full" />}
                            {i === 3 && <FiSmartphone className="w-full h-full" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* App features highlights */}
          <div className="max-w-5xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                <FiShield className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Responsive Design</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Access your financial dashboard from any device with our fully responsive interface
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="h-14 w-14 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                <FiPieChart className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Visual Analytics</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Understand your finances through beautiful charts and visual breakdowns of your spending
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="h-14 w-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                <FiTrendingUp className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Insights</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Receive personalized insights and recommendations to optimize your spending habits
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Sections - Based on Menu Categories */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-3">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Complete Financial Management</span>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl px-2">
              Everything you need to manage your finances
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
              Explore our comprehensive set of features designed to help you take control of your financial life
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {/* Dashboard Feature */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-5">
                <FiBarChart2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Dashboard</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Get a complete overview of your financial health with our intuitive dashboard showing income, expenses, and savings at a glance.</p>
              <ul className="space-y-2 mb-5">
                <li className="flex items-center text-gray-500 dark:text-gray-400">
                  <svg className="h-4 w-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Real-time financial summary
                </li>
                <li className="flex items-center text-gray-500 dark:text-gray-400">
                  <svg className="h-4 w-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Monthly income and expense tracking
                </li>
                <li className="flex items-center text-gray-500 dark:text-gray-400">
                  <svg className="h-4 w-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Savings goals progress
                </li>
              </ul>
              <Link href="/auth/signup" className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-300">
                Try the dashboard <FiArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Transactions Feature */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-5">
                <FiCreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Transactions</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Effortlessly track every transaction with detailed categorization and smart filtering to keep your finances organized.</p>
              <ul className="space-y-2 mb-5">
                <li className="flex items-center text-gray-500 dark:text-gray-400">
                  <svg className="h-4 w-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Smart categorization
                </li>
                <li className="flex items-center text-gray-500 dark:text-gray-400">
                  <svg className="h-4 w-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Search and filter transactions
                </li>
                <li className="flex items-center text-gray-500 dark:text-gray-400">
                  <svg className="h-4 w-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Recurring payment tracking
                </li>
              </ul>
              <Link href="/auth/signup" className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-300">
                Explore transactions <FiArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Analytics Feature */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-5">
                <FiPieChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Analytics</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Gain valuable insights with powerful analytics that help you understand your spending patterns and financial trends.</p>
              <ul className="space-y-2 mb-5">
                <li className="flex items-center text-gray-500 dark:text-gray-400">
                  <svg className="h-4 w-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Visual spending breakdowns
                </li>
                <li className="flex items-center text-gray-500 dark:text-gray-400">
                  <svg className="h-4 w-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Trend analysis over time
                </li>
                <li className="flex items-center text-gray-500 dark:text-gray-400">
                  <svg className="h-4 w-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Customizable reports
                </li>
              </ul>
              <Link href="/auth/signup" className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-300">
                View analytics <FiArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Calendar Feature */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-5">
                <FiCalendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Calendar</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Stay on top of your financial schedule with our calendar view showing upcoming bills, payments, and financial events.</p>
              <ul className="space-y-2 mb-5">
                <li className="flex items-center text-gray-500 dark:text-gray-400">
                  <svg className="h-4 w-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Bill payment reminders
                </li>
                <li className="flex items-center text-gray-500 dark:text-gray-400">
                  <svg className="h-4 w-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Income schedule tracking
                </li>
                <li className="flex items-center text-gray-500 dark:text-gray-400">
                  <svg className="h-4 w-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Financial event planning
                </li>
              </ul>
              <Link href="/auth/signup" className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-300">
                Check the calendar <FiArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Budget Planning Feature */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-5">
                <FiTarget className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Budget Planning</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Create and manage your budgets easily with intelligent suggestions based on your spending history and financial goals.</p>
              <ul className="space-y-2 mb-5">
                <li className="flex items-center text-gray-500 dark:text-gray-400">
                  <svg className="h-4 w-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Smart budget suggestions
                </li>
                <li className="flex items-center text-gray-500 dark:text-gray-400">
                  <svg className="h-4 w-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Monthly and yearly planning
                </li>
                <li className="flex items-center text-gray-500 dark:text-gray-400">
                  <svg className="h-4 w-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Budget vs actual tracking
                </li>
              </ul>
              <Link href="/auth/signup" className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-300">
                Plan your budget <FiArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* ITR Overview Feature */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-5">
                <FiFileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">ITR Overview</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Simplify your tax planning with our comprehensive ITR overview and tax calculator based on Indian tax regulations.</p>
              <ul className="space-y-2 mb-5">
                <li className="flex items-center text-gray-500 dark:text-gray-400">
                  <svg className="h-4 w-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Tax regime comparison
                </li>
                <li className="flex items-center text-gray-500 dark:text-gray-400">
                  <svg className="h-4 w-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Deduction optimization
                </li>
                <li className="flex items-center text-gray-500 dark:text-gray-400">
                  <svg className="h-4 w-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Tax-saving recommendations
                </li>
              </ul>
              <Link href="/auth/signup" className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-300">
                Explore tax planning <FiArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div className="bg-gray-50 dark:bg-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-3">
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">User Testimonials</span>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Loved by thousands
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
              See what our users have to say about how Expenso has transformed their financial lives.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 relative">
              <div className="absolute -top-4 right-4 text-5xl text-purple-200 dark:text-purple-900">"</div>
              <p className="text-gray-600 dark:text-gray-300 relative z-10">
                Expenso has completely changed how I manage my finances. The budget planning feature helped me save an extra $300 every month!
              </p>
              <div className="mt-6 flex items-center">
                <div className="h-10 w-10 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-300">
                  JS
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Jamie S.</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Marketing Manager</p>
                </div>
                </div>
              </div>

            {/* Testimonial 2 */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 relative">
              <div className="absolute -top-4 right-4 text-5xl text-blue-200 dark:text-blue-900">"</div>
              <p className="text-gray-600 dark:text-gray-300 relative z-10">
                The analytics are incredible! I finally understand where my money is going and have cut unnecessary spending by 25%.
              </p>
              <div className="mt-6 flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-300">
                  AT
                  </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Alex T.</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Software Developer</p>
                </div>
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 relative">
              <div className="absolute -top-4 right-4 text-5xl text-green-200 dark:text-green-900">"</div>
              <p className="text-gray-600 dark:text-gray-300 relative z-10">
                I've tried many expense trackers, but Expenso's intuitive interface and smart features make it stand out. Now I actually enjoy managing my finances!
              </p>
              <div className="mt-6 flex items-center">
                <div className="h-10 w-10 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center text-green-600 dark:text-green-300">
                  ML
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Morgan L.</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Freelance Designer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div id="help" className="bg-white dark:bg-gray-900 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-teal-100 dark:bg-teal-900/30 mb-3">
              <span className="text-sm font-medium text-teal-600 dark:text-teal-400">FAQs</span>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
              Everything you need to know about Expenso
            </p>
          </div>
          
          <div className="space-y-8">
            {/* FAQ Item 1 */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Is Expenso free to use?</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Yes, Expenso offers a free plan with core expense tracking and basic budget features. Premium features are available through our affordable subscription plans.
              </p>
            </div>
            
            {/* FAQ Item 2 */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Is my financial data secure?</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Absolutely. We use bank-level encryption and never store your banking credentials. Your privacy and security are our top priorities.
              </p>
            </div>
            
            {/* FAQ Item 3 */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Can I import transactions from my bank?</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Yes, Expenso supports importing transactions from CSV files exported from most major banks and financial institutions.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-20 sm:px-6 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to take control?</span>
              <span className="block text-indigo-200">Start your financial journey today.</span>
          </h2>
            <p className="mt-4 text-lg text-blue-100">
              Join thousands of users who have transformed their financial habits with Expenso.
            </p>
          </div>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0 lg:ml-8">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 transition-all duration-300"
              >
                Create free account <FiArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom scrollbar style */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
        
        /* Also include existing animation definitions */
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        
        .animate-ping-slow {
          animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
} 