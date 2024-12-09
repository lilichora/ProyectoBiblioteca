import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface User {
  id: string
  name: string
  email: string
  userType: string
}

interface UserFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (userData: Omit<User, 'id'> & { password: string }) => void
  initialData?: User | null
  title: string
}

export function UserForm({ isOpen, onClose, onSubmit, initialData, title }: UserFormProps) {
  const [formData, setFormData] = useState<Omit<User, 'id'> & { password: string }>({
    name: '',
    email: '',
    userType: '',
    password: ''
  })

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData, password: '' })
    } else {
      setFormData({
        name: '',
        email: '',
        userType: '',
        password: ''
      })
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, userType: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required={!initialData}
            />
          </div>
          <div>
            <Label htmlFor="userType">Tipo de Usuario</Label>
            <Select onValueChange={handleSelectChange} value={formData.userType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo de usuario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="student">Estudiante</SelectItem>
                <SelectItem value="teacher">Profesor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit">Guardar</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

