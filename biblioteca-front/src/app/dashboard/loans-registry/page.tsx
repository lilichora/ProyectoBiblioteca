'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from '@/hooks/use-toast'

export default function LoansRegistryPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const { toast } = useToast()
  const { users, loans, fetchUsers, fetchLoans } = useStore()

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    if (selectedUserId) {
      fetchLoans(selectedUserId)
    }
  }, [selectedUserId, fetchLoans])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Registro de Préstamos</h1>
      <div className="mb-4">
        <Select onValueChange={(value) => setSelectedUserId(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un usuario" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>{user.email}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {selectedUserId && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Libro</TableHead>
              <TableHead>Fecha de Préstamo</TableHead>
              <TableHead>Fecha de Devolución</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.map((loan) => (
              <TableRow key={loan.id}>
                <TableCell>{loan.bookTitle}</TableCell>
                <TableCell>{new Date(loan.loanDate).toLocaleDateString()}</TableCell>
                <TableCell>{loan.returnDate ? new Date(loan.returnDate).toLocaleDateString() : 'No devuelto'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

