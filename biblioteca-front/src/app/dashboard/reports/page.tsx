'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from '@/hooks/use-toast'

export default function ReportsPage() {
  const [userHistoryData, setUserHistoryData] = useState({
    userId: '',
    format: 'PDF' as 'PDF' | 'EXCEL'
  })
  const [activeLoansData, setActiveLoansData] = useState({
    startDate: '',
    endDate: '',
    userId: '',
    bookCategory: '',
    format: 'PDF' as 'PDF' | 'EXCEL'
  })
  const { toast } = useToast()
  const { generateUserHistory, generateActiveLoansReport } = useStore()

  const handleUserHistorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await generateUserHistory(userHistoryData.userId, userHistoryData.format)
      const { file, format } = response
      const blob = base64ToBlob(file, format)
      downloadFile(blob, `user_history.${format.toLowerCase()}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el reporte",
        variant: "destructive",
      })
    }
  }
  
  const handleActiveLoansSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await generateActiveLoansReport(activeLoansData)
      const { file, format } = response
      const blob = base64ToBlob(file, format)
      downloadFile(blob, `active_loans.${format.toLowerCase()}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el reporte",
        variant: "destructive",
      })
    }
  }
  
  const base64ToBlob = (base64: string, format: string) => {
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    
    const byteArray = new Uint8Array(byteNumbers)
    const mimeType = format === 'PDF' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    
    return new Blob([byteArray], { type: mimeType })
  }

  const downloadFile = (blob: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Reportes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">Historial de Usuario</h2>
          <form onSubmit={handleUserHistorySubmit} className="space-y-4">
            <div>
              <Label htmlFor="userId">ID de Usuario</Label>
              <Input
                id="userId"
                value={userHistoryData.userId}
                onChange={(e) => setUserHistoryData(prev => ({ ...prev, userId: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="format">Formato</Label>
              <Select
                value={userHistoryData.format}
                onValueChange={(value: 'PDF' | 'EXCEL') => setUserHistoryData(prev => ({ ...prev, format: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="EXCEL">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">Generar Reporte</Button>
          </form>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Préstamos Activos</h2>
          <form onSubmit={handleActiveLoansSubmit} className="space-y-4">
            <div>
              <Label htmlFor="startDate">Fecha de Inicio</Label>
              <Input
                id="startDate"
                type="date"
                value={activeLoansData.startDate}
                onChange={(e) => setActiveLoansData(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Fecha de Fin</Label>
              <Input
                id="endDate"
                type="date"
                value={activeLoansData.endDate}
                onChange={(e) => setActiveLoansData(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="userId">ID de Usuario (opcional)</Label>
              <Input
                id="userId"
                value={activeLoansData.userId}
                onChange={(e) => setActiveLoansData(prev => ({ ...prev, userId: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="bookCategory">Categoría de Libro (opcional)</Label>
              <Input
                id="bookCategory"
                value={activeLoansData.bookCategory}
                onChange={(e) => setActiveLoansData(prev => ({ ...prev, bookCategory: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="format">Formato</Label>
              <Select
                value={activeLoansData.format}
                onValueChange={(value: 'PDF' | 'EXCEL') => setActiveLoansData(prev => ({ ...prev, format: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="EXCEL">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">Generar Reporte</Button>
          </form>
        </div>
      </div>
    </div>
  )
}

