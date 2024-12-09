'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useToast } from '@/hooks/use-toast'
import { ConfirmationModal } from '@/components/ConfirmationModal'
import { UserForm } from '@/components/UserForm'

export default function UsersPage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const { toast } = useToast()
  const { users, fetchUsers, registerUser, updateUser, suspendUser } = useStore()

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleEdit = async (userData: User) => {
    try {
      await updateUser(userData.id, userData)
      setIsEditModalOpen(false)
      toast({
        title: "Éxito",
        description: "Usuario actualizado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el usuario",
        variant: "destructive",
      })
    }
  }

  const handleCreate = async (userData: Omit<User, 'id'> & { password: string }) => {
    try {
      await registerUser(userData)
      setIsCreateModalOpen(false)
      toast({
        title: "Éxito",
        description: "Usuario registrado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar el usuario",
        variant: "destructive",
      })
    }
  }

  const handleSuspend = async () => {
    if (!selectedUser) return
    try {
      await suspendUser(selectedUser.id, "Suspensión administrativa")
      setIsSuspendModalOpen(false)
      toast({
        title: "Éxito",
        description: "Usuario suspendido correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo suspender el usuario",
        variant: "destructive",
      })
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Usuarios</h1>
      <Button onClick={() => setIsCreateModalOpen(true)} className="mb-4">Registrar Usuario</Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Tipo de Usuario</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.userType}</TableCell>
              <TableCell>
                <Button variant="outline" className="mr-2" onClick={() => {
                  setSelectedUser(user)
                  setIsEditModalOpen(true)
                }}>Editar</Button>
                <Button variant="destructive" onClick={() => {
                  setSelectedUser(user)
                  setIsSuspendModalOpen(true)
                }}>Suspender</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <UserForm
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEdit}
        initialData={selectedUser}
        title="Editar Usuario"
      />

      <UserForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        title="Registrar Usuario"
      />

      <ConfirmationModal
        isOpen={isSuspendModalOpen}
        onClose={() => setIsSuspendModalOpen(false)}
        onConfirm={handleSuspend}
        title="Suspender Usuario"
        description="¿Estás seguro de que quieres suspender este usuario?"
      />
    </div>
  )
}

