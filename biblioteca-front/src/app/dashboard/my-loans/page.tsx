'use client'

import { useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useToast } from '@/hooks/use-toast'

export default function MyLoansPage() {
  const { toast } = useToast()
  const { user, loans, fetchLoans, returnLoan } = useStore()

  useEffect(() => {
    if (user) {
      fetchLoans(user.id)
    }
  }, [user, fetchLoans])

  const handleReturn = async (loanId: string) => {
    try {
      await returnLoan(loanId)
      toast({
        title: "Éxito",
        description: "Libro devuelto correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo devolver el libro",
        variant: "destructive",
      })
    }
  }

  if (!user) {
    return <div>Cargando...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Mis Préstamos</h1>
      {loans.length === 0 ? (
        <p>No tienes préstamos activos.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Libro</TableHead>
              <TableHead>Fecha de Préstamo</TableHead>
              <TableHead>Fecha de Devolución</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.map((loan) => (
              <TableRow key={loan.id}>
                <TableCell>{loan.bookTitle}</TableCell>
                <TableCell>{new Date(loan.loanDate).toLocaleDateString()}</TableCell>
                <TableCell>{loan.returnDate ? new Date(loan.returnDate).toLocaleDateString() : 'No devuelto'}</TableCell>
                <TableCell>
                  {!loan.returnDate && (
                    <Button onClick={() => handleReturn(loan.id)}>Devolver</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

