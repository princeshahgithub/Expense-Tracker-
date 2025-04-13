'use client'

import React, { useState } from 'react'
import { useTranslation } from '@/contexts/TranslationContext'
import { FiAlertTriangle, FiFileText, FiInfo, FiArrowRight, FiCheck } from 'react-icons/fi'

// Define tax slabs for both regimes
const OLD_REGIME_SLABS = {
  general: [
    { limit: 250000, rate: 0 },
    { limit: 500000, rate: 5 },
    { limit: 1000000, rate: 20 },
    { limit: Infinity, rate: 30 }
  ],
  senior: [
    { limit: 300000, rate: 0 },
    { limit: 500000, rate: 5 },
    { limit: 1000000, rate: 20 },
    { limit: Infinity, rate: 30 }
  ],
  superSenior: [
    { limit: 500000, rate: 0 },
    { limit: 1000000, rate: 20 },
    { limit: Infinity, rate: 30 }
  ]
}

const NEW_REGIME_SLABS = [
  { limit: 300000, rate: 0 },
  { limit: 600000, rate: 5 },
  { limit: 900000, rate: 10 },
  { limit: 1200000, rate: 15 },
  { limit: 1500000, rate: 20 },
  { limit: Infinity, rate: 30 }
]

// Initial form state
const initialFormState = {
  income: {
    salary: 0,
    business: 0,
    other: 0
  },
  deductions: {
    section80C: 0,
    section80D: 0,
    hra: 0,
    others: 0
  },
  capitalGains: 0,
  age: 'general', // general, senior, superSenior
  regimePreference: 'both' // old, new, both
}

export default function ITROverviewPage() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState(initialFormState)
  const [showResults, setShowResults] = useState(false)
  const [taxResults, setTaxResults] = useState({ old: null, new: null })

  // Handle form input changes
  const handleInputChange = (category: any, field: any, value: any) => {
    const numValue = value === '' ? 0 : Number(value)
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: numValue
      }
    }))
  }

  // Handle simple field changes
  const handleSimpleChange = (field: any, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Calculate tax based on regime and income
  const calculateTax = () => {
    // Calculate total income
    const totalIncome = formData.income.salary + formData.income.business + formData.income.other

    // Calculate total deductions (only applicable for old regime)
    const totalDeductions = formData.deductions.section80C + formData.deductions.section80D + 
                           formData.deductions.hra + formData.deductions.others

    // Calculate taxable income under old regime
    const oldRegimeTaxableIncome = Math.max(0, totalIncome - totalDeductions)
    
    // Calculate taxable income under new regime (limited deductions)
    const newRegimeTaxableIncome = totalIncome

    // Calculate tax for old regime
    const oldRegimeTax = calculateTaxForSlab(oldRegimeTaxableIncome, 
                                           formData.age === 'general' ? OLD_REGIME_SLABS.general :
                                           formData.age === 'senior' ? OLD_REGIME_SLABS.senior :
                                           OLD_REGIME_SLABS.superSenior)

    // Calculate tax for new regime
    const newRegimeTax = calculateTaxForSlab(newRegimeTaxableIncome, NEW_REGIME_SLABS)

    // Calculate cess (4% on tax)
    const oldRegimeCess = oldRegimeTax * 0.04
    const newRegimeCess = newRegimeTax * 0.04

    // Calculate total tax payable
    const oldRegimeTotalTax = oldRegimeTax + oldRegimeCess
    const newRegimeTotalTax = newRegimeTax + newRegimeCess

    // Determine if rebate under section 87A is applicable (for taxable income up to 5 lakhs)
    let oldRegimeRebate = 0
    let newRegimeRebate = 0

    if (oldRegimeTaxableIncome <= 500000) {
      oldRegimeRebate = Math.min(oldRegimeTax, 12500)
    }

    if (newRegimeTaxableIncome <= 700000) {
      newRegimeRebate = Math.min(newRegimeTax, 25000)
    }

    // Final tax after rebate
    const oldRegimeFinalTax = Math.max(0, oldRegimeTotalTax - oldRegimeRebate)
    const newRegimeFinalTax = Math.max(0, newRegimeTotalTax - newRegimeRebate)

    // Calculate suggested tax savings
    const maxSection80C = 150000
    const maxSection80D = formData.age === 'general' ? 25000 : 50000
    const potentialSection80CSavings = Math.max(0, maxSection80C - formData.deductions.section80C)
    const potentialSection80DSavings = Math.max(0, maxSection80D - formData.deductions.section80D)

    // Set tax results
    setTaxResults({
      old: {
        taxableIncome: oldRegimeTaxableIncome,
        basicTax: oldRegimeTax,
        cess: oldRegimeCess,
        rebate: oldRegimeRebate,
        totalTax: oldRegimeFinalTax,
        potentialSavings: {
          section80C: potentialSection80CSavings,
          section80D: potentialSection80DSavings
        }
      },
      new: {
        taxableIncome: newRegimeTaxableIncome,
        basicTax: newRegimeTax,
        cess: newRegimeCess,
        rebate: newRegimeRebate,
        totalTax: newRegimeFinalTax,
        potentialSavings: {}
      }
    })

    setShowResults(true)
  }

  // Helper function to calculate tax for a specific slab structure
  const calculateTaxForSlab = (income, slabs) => {
    let remainingIncome = income
    let tax = 0

    for (let i = 0; i < slabs.length; i++) {
      const currentSlab = slabs[i]
      const prevLimit = i === 0 ? 0 : slabs[i-1].limit
      const slabAmount = Math.min(remainingIncome, currentSlab.limit - prevLimit)
      
      if (slabAmount <= 0) break
      
      tax += slabAmount * (currentSlab.rate / 100)
      remainingIncome -= slabAmount
      
      if (remainingIncome <= 0) break
    }

    return tax
  }

  // Handle form reset
  const resetForm = () => {
    setFormData(initialFormState)
    setShowResults(false)
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Determine better regime
  const determineBetterRegime = () => {
    if (!taxResults.old || !taxResults.new) return null
    
    if (taxResults.old.totalTax < taxResults.new.totalTax) {
      return 'old'
    } else if (taxResults.new.totalTax < taxResults.old.totalTax) {
      return 'new'
    } else {
      return 'equal'
    }
  }

  const betterRegime = determineBetterRegime()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">ITR Overview</h1>
      </div>

      <div className="bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700 p-4 rounded-lg">
        <div className="flex items-start">
          <FiAlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h3 className="text-amber-800 dark:text-amber-300 font-medium">Disclaimer</h3>
            <p className="text-amber-700 dark:text-amber-400">
              This tool provides a basic estimation for informational purposes only. For official filing, consult a Chartered Accountant or use the Income Tax Department's e-filing portal. We do not collect or store sensitive tax-related data.
            </p>
          </div>
        </div>
      </div>

      {!showResults ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Enter Your Tax Details</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Provide the following information to get an estimate of your income tax liability.
            </p>
            
            <div className="space-y-6">
              {/* Income Section */}
              <div>
                <h3 className="text-lg font-medium mb-2">Annual Income</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Salary Income
                    </label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      value={formData.income.salary === 0 ? '' : formData.income.salary}
                      onChange={(e) => handleInputChange('income', 'salary', e.target.value)}
                      placeholder="Enter amount (e.g., ₹5,00,000)"
                      aria-label="Salary Income"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Business Income
                    </label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      value={formData.income.business === 0 ? '' : formData.income.business}
                      onChange={(e) => handleInputChange('income', 'business', e.target.value)}
                      placeholder="Enter amount (e.g., ₹3,00,000)"
                      aria-label="Business Income"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Other Income
                    </label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      value={formData.income.other === 0 ? '' : formData.income.other}
                      onChange={(e) => handleInputChange('income', 'other', e.target.value)}
                      placeholder="Enter amount (e.g., ₹50,000)"
                      aria-label="Other Income"
                    />
                  </div>
                </div>
              </div>
              
              {/* Deductions Section */}
              <div>
                <h3 className="text-lg font-medium mb-2">Eligible Deductions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Section 80C (max ₹1,50,000)
                    </label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      value={formData.deductions.section80C === 0 ? '' : formData.deductions.section80C}
                      onChange={(e) => handleInputChange('deductions', 'section80C', e.target.value)}
                      placeholder="Enter amount (max ₹1,50,000)"
                      aria-label="Section 80C Deductions"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      PPF, ELSS, Life Insurance, EPF, etc.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Section 80D (Health Insurance)
                    </label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      value={formData.deductions.section80D === 0 ? '' : formData.deductions.section80D}
                      onChange={(e) => handleInputChange('deductions', 'section80D', e.target.value)}
                      placeholder="Enter amount (e.g., ₹25,000)"
                      aria-label="Section 80D Health Insurance"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Health insurance premiums for self, family and parents
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      HRA Exemption
                    </label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      value={formData.deductions.hra === 0 ? '' : formData.deductions.hra}
                      onChange={(e) => handleInputChange('deductions', 'hra', e.target.value)}
                      placeholder="Enter amount (e.g., ₹60,000)"
                      aria-label="HRA Exemption"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Other Deductions
                    </label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      value={formData.deductions.others === 0 ? '' : formData.deductions.others}
                      onChange={(e) => handleInputChange('deductions', 'others', e.target.value)}
                      placeholder="Enter amount (e.g., ₹10,000)"
                      aria-label="Other Deductions"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      80E, 80G, 80TTA, etc.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Other Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Capital Gains (if any)
                  </label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    value={formData.capitalGains === 0 ? '' : formData.capitalGains}
                    onChange={(e) => handleSimpleChange('capitalGains', Number(e.target.value))}
                    placeholder="Enter amount (e.g., ₹1,00,000)"
                    aria-label="Capital Gains"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Age Category
                  </label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    value={formData.age}
                    onChange={(e) => handleSimpleChange('age', e.target.value)}
                    aria-label="Age Category"
                  >
                    <option value="general">Below 60 years</option>
                    <option value="senior">Senior Citizen (60-80 years)</option>
                    <option value="superSenior">Super Senior Citizen (Above 80 years)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tax Regime Preference
                  </label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    value={formData.regimePreference}
                    onChange={(e) => handleSimpleChange('regimePreference', e.target.value)}
                    aria-label="Tax Regime Preference"
                  >
                    <option value="both">Show Both Regimes</option>
                    <option value="old">Old Regime Only</option>
                    <option value="new">New Regime Only</option>
                  </select>
                </div>
              </div>
              
              {/* Calculate Button */}
              <div className="flex justify-center mt-8">
                <button
                  onClick={calculateTax}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm flex items-center"
                >
                  Calculate Tax Estimate
                  <FiArrowRight className="ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your Tax Estimate</h2>
              <button
                onClick={resetForm}
                className="px-4 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Recalculate
              </button>
            </div>
            
            {betterRegime && (
              <div className={`mb-6 p-4 rounded-md ${
                betterRegime === 'old' ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 
                betterRegime === 'new' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
                'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'
              }`}>
                <div className="flex items-center">
                  <FiCheck className={`h-5 w-5 mr-2 ${
                    betterRegime === 'old' ? 'text-blue-600 dark:text-blue-400' : 
                    betterRegime === 'new' ? 'text-green-600 dark:text-green-400' :
                    'text-purple-600 dark:text-purple-400'
                  }`} />
                  <h3 className={`font-medium ${
                    betterRegime === 'old' ? 'text-blue-800 dark:text-blue-300' : 
                    betterRegime === 'new' ? 'text-green-800 dark:text-green-300' :
                    'text-purple-800 dark:text-purple-300'
                  }`}>
                    {betterRegime === 'old' ? 'Old Regime is Better for You' : 
                     betterRegime === 'new' ? 'New Regime is Better for You' :
                     'Both Regimes Result in the Same Tax'}
                  </h3>
                </div>
                <p className={`mt-1 text-sm ${
                  betterRegime === 'old' ? 'text-blue-700 dark:text-blue-400' : 
                  betterRegime === 'new' ? 'text-green-700 dark:text-green-400' :
                  'text-purple-700 dark:text-purple-400'
                }`}>
                  {betterRegime === 'old' ? 
                    `You save ${formatCurrency(taxResults.new.totalTax - taxResults.old.totalTax)} by choosing the Old Tax Regime.` : 
                   betterRegime === 'new' ? 
                    `You save ${formatCurrency(taxResults.old.totalTax - taxResults.new.totalTax)} by choosing the New Tax Regime.` :
                    'Both regimes result in the same tax liability. You may choose either.'}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Old Regime Results */}
              {(formData.regimePreference === 'old' || formData.regimePreference === 'both') && taxResults.old && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-medium mb-4">Old Tax Regime</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Income:</span>
                      <span className="font-medium">{formatCurrency(formData.income.salary + formData.income.business + formData.income.other)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Deductions:</span>
                      <span className="font-medium">{formatCurrency(formData.deductions.section80C + formData.deductions.section80D + formData.deductions.hra + formData.deductions.others)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Taxable Income:</span>
                      <span>{formatCurrency(taxResults.old.taxableIncome)}</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-600 my-2 pt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Basic Tax:</span>
                        <span>{formatCurrency(taxResults.old.basicTax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Health & Education Cess (4%):</span>
                        <span>{formatCurrency(taxResults.old.cess)}</span>
                      </div>
                      {taxResults.old.rebate > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Rebate (Section 87A):</span>
                          <span className="text-green-600 dark:text-green-400">- {formatCurrency(taxResults.old.rebate)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total Tax Payable:</span>
                      <span className={betterRegime === 'old' ? 'text-blue-600 dark:text-blue-400' : ''}>
                        {formatCurrency(taxResults.old.totalTax)}
                      </span>
                    </div>
                    
                    {/* Tax saving suggestions */}
                    {taxResults.old.potentialSavings.section80C > 0 || taxResults.old.potentialSavings.section80D > 0 ? (
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Tax Saving Suggestions</h4>
                        <ul className="space-y-1 text-xs text-blue-700 dark:text-blue-400">
                          {taxResults.old.potentialSavings.section80C > 0 && (
                            <li className="flex items-start">
                              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1 mr-2"></div>
                              <span>You can save up to {formatCurrency(taxResults.old.potentialSavings.section80C)} more under Section 80C investments.</span>
                            </li>
                          )}
                          {taxResults.old.potentialSavings.section80D > 0 && (
                            <li className="flex items-start">
                              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1 mr-2"></div>
                              <span>You can save up to {formatCurrency(taxResults.old.potentialSavings.section80D)} more under Section 80D health insurance.</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
              
              {/* New Regime Results */}
              {(formData.regimePreference === 'new' || formData.regimePreference === 'both') && taxResults.new && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-medium mb-4">New Tax Regime</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Income:</span>
                      <span className="font-medium">{formatCurrency(formData.income.salary + formData.income.business + formData.income.other)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Available Deductions:</span>
                      <span className="font-medium">Limited under New Regime</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Taxable Income:</span>
                      <span>{formatCurrency(taxResults.new.taxableIncome)}</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-600 my-2 pt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Basic Tax:</span>
                        <span>{formatCurrency(taxResults.new.basicTax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Health & Education Cess (4%):</span>
                        <span>{formatCurrency(taxResults.new.cess)}</span>
                      </div>
                      {taxResults.new.rebate > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Rebate (Section 87A):</span>
                          <span className="text-green-600 dark:text-green-400">- {formatCurrency(taxResults.new.rebate)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total Tax Payable:</span>
                      <span className={betterRegime === 'new' ? 'text-green-600 dark:text-green-400' : ''}>
                        {formatCurrency(taxResults.new.totalTax)}
                      </span>
                    </div>
                    
                    <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-600/50 rounded-md">
                      <h4 className="text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">New Regime Features</h4>
                      <ul className="space-y-1 text-xs text-gray-700 dark:text-gray-400">
                        <li className="flex items-start">
                          <div className="h-1.5 w-1.5 rounded-full bg-gray-500 mt-1 mr-2"></div>
                          <span>Simplified tax structure with more slabs</span>
                        </li>
                        <li className="flex items-start">
                          <div className="h-1.5 w-1.5 rounded-full bg-gray-500 mt-1 mr-2"></div>
                          <span>Limited deductions and exemptions</span>
                        </li>
                        <li className="flex items-start">
                          <div className="h-1.5 w-1.5 rounded-full bg-gray-500 mt-1 mr-2"></div>
                          <span>Higher rebate limit of ₹7,00,000</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="mb-4">
            <div className="flex items-center text-lg font-semibold mb-2">
              <FiFileText className="mr-2 h-5 w-5 text-blue-500" />
              Income Tax Return Overview
            </div>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This tool follows the latest tax regulations including:
            </p>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex items-start">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 mr-2"></div>
                <span>Income slabs and rates as notified by the Union Budget</span>
              </li>
              <li className="flex items-start">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 mr-2"></div>
                <span>Deduction limits under Section 80C, 80D, and other sections</span>
              </li>
              <li className="flex items-start">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 mr-2"></div>
                <span>Provisions of the Finance Act</span>
              </li>
              <li className="flex items-start">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 mr-2"></div>
                <span>Applicability of surcharge, cess, and rebates</span>
              </li>
              <li className="flex items-start">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 mr-2"></div>
                <span>Differentiation by age group</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="mb-4">
            <div className="flex items-center text-lg font-semibold mb-2">
              <FiInfo className="mr-2 h-5 w-5 text-purple-500" />
              Old vs New Tax Regime
            </div>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The key differences between the tax regimes:
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-2 text-left font-medium text-gray-700 dark:text-gray-300">Feature</th>
                    <th className="pb-2 text-left font-medium text-blue-600 dark:text-blue-400">Old Regime</th>
                    <th className="pb-2 text-left font-medium text-green-600 dark:text-green-400">New Regime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="py-2 text-gray-600 dark:text-gray-400">Tax Slabs</td>
                    <td className="py-2 text-gray-800 dark:text-gray-200">Fewer slabs</td>
                    <td className="py-2 text-gray-800 dark:text-gray-200">More slabs</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-600 dark:text-gray-400">Deductions</td>
                    <td className="py-2 text-gray-800 dark:text-gray-200">All available</td>
                    <td className="py-2 text-gray-800 dark:text-gray-200">Limited</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-600 dark:text-gray-400">HRA Exemption</td>
                    <td className="py-2 text-gray-800 dark:text-gray-200">Available</td>
                    <td className="py-2 text-gray-800 dark:text-gray-200">Not available</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-600 dark:text-gray-400">Standard Deduction</td>
                    <td className="py-2 text-gray-800 dark:text-gray-200">₹50,000</td>
                    <td className="py-2 text-gray-800 dark:text-gray-200">₹50,000</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-600 dark:text-gray-400">Rebate Limit</td>
                    <td className="py-2 text-gray-800 dark:text-gray-200">₹5,00,000</td>
                    <td className="py-2 text-gray-800 dark:text-gray-200">₹7,00,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 