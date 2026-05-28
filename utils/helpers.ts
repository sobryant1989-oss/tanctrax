export function generateWorkOrderNumber(year: number, sequence: number): string {
  const paddedSequence = String(sequence).padStart(6, '0')
  return `WO-${year}-${paddedSequence}`
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

export function getStatusColor(status: string): string {
  const colors: { [key: string]: string } = {
    'New': 'bg-blue-100 text-blue-800',
    'Sent': 'bg-purple-100 text-purple-800',
    'Acknowledged': 'bg-cyan-100 text-cyan-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
    'Waiting Parts': 'bg-orange-100 text-orange-800',
    'Completed': 'bg-green-100 text-green-800',
    'Closed': 'bg-gray-100 text-gray-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getPriorityColor(priority: string): string {
  const colors: { [key: string]: string } = {
    'Low': 'text-green-600',
    'Medium': 'text-yellow-600',
    'High': 'text-orange-600',
    'Urgent': 'text-red-600',
  }
  return colors[priority] || 'text-gray-600'
}