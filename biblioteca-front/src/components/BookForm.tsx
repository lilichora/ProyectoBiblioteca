import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Book {
  id: string
  title: string
  author: string
  isbn: string
  category: string
  quantity: number
  location: string
  availability: boolean
}

interface BookFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (bookData: Omit<Book, 'id' | 'availability'>) => void
  initialData?: Book | null
  title: string
}

export function BookForm({ isOpen, onClose, onSubmit, initialData, title }: BookFormProps) {
  const [formData, setFormData] = useState<Omit<Book, 'id' | 'availability'>>({
    title: '',
    author: '',
    isbn: '',
    category: '',
    quantity: 0,
    location: ''
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        author: initialData.author,
        isbn: initialData.isbn,
        category: initialData.category,
        quantity: initialData.quantity,
        location: initialData.location
      })
    } else {
      setFormData({
        title: '',
        author: '',
        isbn: '',
        category: '',
        quantity: 0,
        location: ''
      })
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: name === 'quantity' ? parseInt(value) : value }))
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
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="author">Autor</Label>
            <Input
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="isbn">ISBN</Label>
            <Input
              id="isbn"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Categoría</Label>
            <Input
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="quantity">Cantidad</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="location">Ubicación</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>
          <Button type="submit">Guardar</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

