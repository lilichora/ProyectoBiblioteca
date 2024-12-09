'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from '@/hooks/use-toast'
import { ConfirmationModal } from '@/components/ConfirmationModal'
import { BookForm } from '@/components/BookForm'

export default function BooksPage() {
  const [searchTitle, setSearchTitle] = useState('')
  const [searchCategory, setSearchCategory] = useState('')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const { toast } = useToast()
  const { user, books, fetchBooks, createBook, updateBook, deleteBook, createLoan } = useStore()

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchBooks(searchTitle, searchCategory)
  }

  const handleCreate = async (bookData: Omit<Book, 'id' | 'availability'>) => {
    try {
      await createBook(bookData)
      setIsCreateModalOpen(false)
      toast({
        title: "Éxito",
        description: "Libro creado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el libro",
        variant: "destructive",
      })
    }
  }

  const handleEdit = async (bookData: Omit<Book, 'id' | 'availability'>) => {
    if (!selectedBook) return
    try {
      await updateBook(selectedBook.id, bookData)
      setIsEditModalOpen(false)
      toast({
        title: "Éxito",
        description: "Libro actualizado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error", 
        description: "No se pudo actualizar el libro",
        variant: "destructive",
      })
    }
  }
  const handleDelete = async () => {
    if (!selectedBook) return
    try {
      await deleteBook(selectedBook.id)
      setIsDeleteModalOpen(false)
      toast({
        title: "Éxito",
        description: "Libro eliminado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el libro",
        variant: "destructive",
      })
    }
  }

  const handleLoan = async (bookId: string) => {
    if (!user) return
    try {
      await createLoan(bookId, user.id)
      toast({
        title: "Éxito",
        description: "Préstamo realizado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo realizar el préstamo",
        variant: "destructive",
      })
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Libros</h1>
      <form onSubmit={handleSearch} className="mb-4 flex gap-4">
        <Input
          placeholder="Buscar por título"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
        />
        <Input
          placeholder="Buscar por categoría"
          value={searchCategory}
          onChange={(e) => setSearchCategory(e.target.value)}
        />
        <Button type="submit">Buscar</Button>
        {user?.userType === 'admin' && (
          <Button onClick={() => setIsCreateModalOpen(true)}>Crear Libro</Button>
        )}
      </form>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Autor</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>ISBN</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Ubicación</TableHead>
            <TableHead>Disponibilidad</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {books.map((book) => (
            <TableRow key={book.id}>
              <TableCell>{book.title}</TableCell>
              <TableCell>{book.author}</TableCell>
              <TableCell>{book.category}</TableCell>
              <TableCell>{book.isbn}</TableCell>
              <TableCell>{book.quantity}</TableCell>
              <TableCell>{book.location}</TableCell>
              <TableCell>{book.availability ? 'Disponible' : 'No disponible'}</TableCell>
              <TableCell>
                {user?.userType === 'admin' ? (
                  <>
                    <Button variant="outline" className="mr-2" onClick={() => {
                      setSelectedBook(book)
                      setIsEditModalOpen(true)
                    }}>Editar</Button>
                    <Button variant="destructive" onClick={() => {
                      setSelectedBook(book)
                      setIsDeleteModalOpen(true)
                    }}>Eliminar</Button>
                  </>
                ) : (
                  <Button onClick={() => handleLoan(book.id)} disabled={!book.availability}>
                    {book.availability ? 'Pedir prestado' : 'No disponible'}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Libro"
        description="¿Estás seguro de que quieres eliminar este libro?"
      />

      <BookForm
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEdit}
        initialData={selectedBook}
        title="Editar Libro"
      />

      <BookForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        title="Crear Libro"
      />
    </div>
  )
}

