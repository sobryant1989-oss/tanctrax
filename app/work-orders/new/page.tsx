'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BUILDINGS } from '@/lib/buildings'
import { ENGINEER_CONTACTS } from '@/lib/contacts'
import { createWorkOrder } from '@/services/workOrderService'

type WorkOrderFormState = {
  engineerName: string
  engineerEmail: string
  pcrSoNumber: string
  buildingAbbr: string
  building: string
  roomNumber: string
  scopeOfWork: string
}

type PreviewWorkOrder = {
  workOrderNumber: string
  generatedAt: Date
  data: WorkOrderFormState
}

const emptyFormData: WorkOrderFormState = {
  engineerName: '',
  engineerEmail: '',
  pcrSoNumber: '',
  buildingAbbr: '',
  building: '',
  roomNumber: '',
  scopeOfWork: '',
}

export default function NewWorkOrder() {
  const router = useRouter()
  const [formData, setFormData] = useState<WorkOrderFormState>(emptyFormData)

  const [submitted, setSubmitted] = useState(false)
  const [submittedWorkOrderNumber, setSubmittedWorkOrderNumber] = useState('')
  const [previewWorkOrder, setPreviewWorkOrder] = useState<PreviewWorkOrder | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === 'buildingAbbr') {
      const selectedBuilding = BUILDINGS.find(
        building => building.abbr.toLowerCase() === value.trim().toLowerCase()
      )
      setFormData(prev => ({
        ...prev,
        buildingAbbr: value.trim().toUpperCase(),
        building: selectedBuilding?.name ?? '',
      }))
      return
    }

    if (name === 'engineerName') {
      const selectedEngineer = ENGINEER_CONTACTS.find(
        engineer => engineer.name.toLowerCase() === value.trim().toLowerCase()
      )
      setFormData(prev => ({
        ...prev,
        engineerName: value,
        engineerEmail: selectedEngineer?.email ?? '',
      }))
      return
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const workOrderNumber = `WO-${formData.pcrSoNumber.trim()}`
    setPreviewWorkOrder({
      workOrderNumber,
      generatedAt: new Date(),
      data: {
        ...formData,
        pcrSoNumber: formData.pcrSoNumber.trim(),
      },
    })
  }

  const buildMailtoUrl = (data: typeof previewWorkOrder) => {
    if (!data) return ''

    const subject = `PCR SO# ${data.data.pcrSoNumber} - ${data.data.buildingAbbr}`
    const body = [
      `Work Order Number: ${data.workOrderNumber}`,
      `Generated At: ${data.generatedAt.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
      `Engineer: ${data.data.engineerName} <${data.data.engineerEmail}>`,
      `PCR SO#: ${data.data.pcrSoNumber}`,
      `Building: ${data.data.building} (${data.data.buildingAbbr})`,
      `Room: ${data.data.roomNumber}`,
      'Scope Of Work:',
      data.data.scopeOfWork,
    ].join('\n')

    return `mailto:sheltonbryant@lsu.edu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const handleFinalSubmit = async () => {
    if (!previewWorkOrder) return
    setSubmitting(true)

    const workOrderData = {
      ...previewWorkOrder.data,
      pcrSoNumber: previewWorkOrder.data.pcrSoNumber.trim(),
      workOrderNumber: previewWorkOrder.workOrderNumber,
      generatedAt: previewWorkOrder.generatedAt.toISOString(),
    }

    const createdOrder = await createWorkOrder(workOrderData)
    const mailtoUrl = buildMailtoUrl(previewWorkOrder)

    if (typeof window !== 'undefined' && mailtoUrl) {
      window.open(mailtoUrl)
    }

    console.log('Form submitted:', workOrderData)
    setSubmittedWorkOrderNumber(previewWorkOrder.workOrderNumber)
    setSubmitted(true)
    setPreviewWorkOrder(null)
    setFormData(emptyFormData)
    router.push(`/work-orders?created=${createdOrder.id}`)
  }

  if (previewWorkOrder) {
    const previewRows = [
      ['Engineer Name', previewWorkOrder.data.engineerName],
      ['Engineer Email', previewWorkOrder.data.engineerEmail],
      ['PCR SO#', previewWorkOrder.data.pcrSoNumber],
      ['Building Abbreviation', previewWorkOrder.data.buildingAbbr],
      ['Building Name', previewWorkOrder.data.building],
      ['Room Number', previewWorkOrder.data.roomNumber],
      ['Scope of Work', previewWorkOrder.data.scopeOfWork],
    ]

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Preview Work Order</h1>
            <button
              type="button"
              onClick={() => setPreviewWorkOrder(null)}
              className="text-[#461D7C] hover:text-[#2b0f4f] font-medium"
            >
              Back to Edit
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-6 mb-6 border-b border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase">Work Order Number</p>
                <p className="text-2xl font-bold text-gray-900">{previewWorkOrder.workOrderNumber}</p>
              </div>
              <div className="md:text-right">
                <p className="text-sm font-medium text-gray-500 uppercase">Date Generated</p>
                <p className="text-lg font-semibold text-gray-900">
                  {previewWorkOrder.generatedAt.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {previewRows.map(([label, value]) => (
                <div key={label} className="grid grid-cols-1 md:grid-cols-3 gap-2 py-3 border-b border-gray-100 last:border-b-0">
                  <dt className="text-sm font-medium text-gray-600">{label}</dt>
                  <dd className="md:col-span-2 text-sm text-gray-900 whitespace-pre-wrap">{value}</dd>
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-8">
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="flex-1 bg-[#FDD023] hover:bg-[#e5b800] disabled:bg-gray-300 disabled:cursor-not-allowed text-[#461D7C] font-semibold py-2 px-4 rounded-lg transition"
              >
                {submitting ? 'Submitting...' : 'Submit Work Order'}
              </button>
              <button
                type="button"
                onClick={() => setPreviewWorkOrder(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
              >
                Edit
              </button>
              <Link
                href="/work-orders"
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition text-center"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Work Order</h1>
          <Link 
            href="/work-orders"
            className="text-[#461D7C] hover:text-[#2b0f4f] font-medium"
          >
            ← Back to Work Orders
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          {submitted && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                ✓ Work order {submittedWorkOrderNumber} created successfully!
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Engineer Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="engineerName" className="block text-sm font-medium text-gray-700 mb-2">
                  Engineer Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="engineerName"
                  name="engineerName"
                  list="engineer-name-options"
                  value={formData.engineerName}
                  onChange={handleChange}
                  required
                  placeholder="Search or select an engineer"
                  autoComplete="off"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDD023] focus:border-transparent outline-none transition"
                />
                <datalist id="engineer-name-options">
                  {ENGINEER_CONTACTS.map(engineer => (
                    <option key={engineer.email} value={engineer.name}>
                      {engineer.email}
                    </option>
                  ))}
                </datalist>
              </div>

              <div>
                <label htmlFor="engineerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  id="engineerEmail"
                  name="engineerEmail"
                  value={formData.engineerEmail}
                  readOnly
                  required
                  placeholder="Email will populate automatically"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 outline-none transition"
                />
              </div>
            </div>

            {/* PCR SO Number */}
            <div>
              <label htmlFor="pcrSoNumber" className="block text-sm font-medium text-gray-700 mb-2">
                PCR SO# <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="pcrSoNumber"
                name="pcrSoNumber"
                value={formData.pcrSoNumber}
                onChange={handleChange}
                required
                placeholder="Enter PCR SO#"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDD023] focus:border-transparent outline-none transition"
              />
            </div>

            {/* Building ABBR */}
            <div>
              <label htmlFor="buildingAbbr" className="block text-sm font-medium text-gray-700 mb-2">
                Building Abbreviations <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="buildingAbbr"
                name="buildingAbbr"
                list="building-abbr-options"
                value={formData.buildingAbbr}
                onChange={handleChange}
                required
                placeholder="Search or select an abbreviation"
                autoComplete="off"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDD023] focus:border-transparent outline-none transition"
              />
              <datalist id="building-abbr-options">
                {BUILDINGS.map(building => (
                  <option key={building.abbr} value={building.abbr}>
                    {building.name}
                  </option>
                ))}
              </datalist>
            </div>

            {/* Building Name */}
            <div>
              <label htmlFor="building" className="block text-sm font-medium text-gray-700 mb-2">
                Building Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="building"
                name="building"
                value={formData.building}
                readOnly
                required
                placeholder="Building name will populate automatically"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 outline-none transition"
              />
            </div>

            {/* Room Number */}
            <div>
              <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Room Number <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="roomNumber"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                required
                placeholder="Enter room number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDD023] focus:border-transparent outline-none transition"
              />
            </div>

            {/* Scope of Work */}
            <div>
              <label htmlFor="scopeOfWork" className="block text-sm font-medium text-gray-700 mb-2">
                Scope of Work <span className="text-red-600">*</span>
              </label>
              <textarea
                id="scopeOfWork"
                name="scopeOfWork"
                value={formData.scopeOfWork}
                onChange={handleChange}
                required
                placeholder="Describe the work to be performed..."
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FDD023] focus:border-transparent outline-none transition resize-none"
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-[#FDD023] hover:bg-[#e5b800] text-[#461D7C] font-semibold py-2 px-4 rounded-lg transition"
              >
                Preview Work Order
              </button>
              <Link
                href="/work-orders"
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
