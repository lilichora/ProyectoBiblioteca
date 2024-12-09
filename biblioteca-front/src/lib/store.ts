import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axiosInstance from './axios'

interface User {
  id: string
  name: string
  email: string
  userType: string
}

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

interface Loan {
  id: string
  bookTitle: string
  loanDate: string
  returnDate: string | null
}
interface ReportResponse {
  file: string
  format: 'PDF' | 'EXCEL'
}
interface AuthStore {
  token: string | null
  user: User | null
  setAuth: (token: string, user: User) => void
  clearAuth: () => void
  users: User[]
  books: Book[]
  loans: Loan[]
  fetchUsers: () => Promise<void>
  fetchBooks: (title?: string, category?: string) => Promise<void>
  fetchLoans: (userId: string) => Promise<void>
  createBook: (book: Omit<Book, 'id' | 'availability'>) => Promise<void>
  updateBook: (id: string, book: Partial<Book>) => Promise<void>
  deleteBook: (id: string) => Promise<void>
  createLoan: (bookId: string, userId: string) => Promise<void>
  returnLoan: (loanId: string) => Promise<void>
  registerUser: (user: Omit<User, 'id'> & { password: string }) => Promise<void>
  updateUser: (id: string, user: Partial<User> & { password?: string }) => Promise<void>
  suspendUser: (userId: string, reason: string) => Promise<void>
  generateUserHistory: (userId: string, format: 'PDF' | 'EXCEL') => Promise<ReportResponse>
  generateActiveLoansReport: (params: {
    startDate: string
    endDate: string
    userId?: string
    bookCategory?: string
    format: 'PDF' | 'EXCEL'
  }) => Promise<ReportResponse>
}

export const useStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      users: [],
      books: [],
      loans: [],
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),
      fetchUsers: async () => {
        const response = await axiosInstance.get('/usuarios')
        set({ users: response.data })
      },
      fetchBooks: async (title, category) => {
        const response = await axiosInstance.get('/libros', {
          params: { titulo: title, categoria: category }
        })
        set({ books: response.data })
      },
      fetchLoans: async (userId) => {
        const response = await axiosInstance.get(`usuarios/${userId}/prestamos`)
        set({ loans: response.data })
      },
      createBook: async (book) => {
        await axiosInstance.post('/libros', book)
        get().fetchBooks()
      },
      updateBook: async (id, book) => {
        await axiosInstance.put(`/libros/${id}`, book)
        get().fetchBooks()
      },
      deleteBook: async (id) => {
        await axiosInstance.delete(`/libros/${id}`)
        get().fetchBooks()
      },
      createLoan: async (bookId, userId) => {
        await axiosInstance.post('/proxy/soap/loans/create', { bookId, userId })
        get().fetchLoans(userId)
      },
      returnLoan: async (loanId) => {
        await axiosInstance.post('/proxy/soap/loans/return', { loanId })
        if (get().user) {
          get().fetchLoans(get().user.id)
        }
      },
      registerUser: async (user) => {
        await axiosInstance.post('/proxy/soap/users/register', user)
        get().fetchUsers()
      },
      updateUser: async (id, user) => {
        await axiosInstance.put(`/usuarios/${id}`, user)
        get().fetchUsers()
      },
      suspendUser: async (userId, reason) => {
        await axiosInstance.post('/proxy/soap/users/suspend', { userId, reason })
        get().fetchUsers()
      },
      generateUserHistory: async (userId, format) => {
        const response = await axiosInstance.post('/proxy/soap/reports/user-history', { userId, format })
        return response.data
      },
      generateActiveLoansReport: async (params) => {
        const response = await axiosInstance.post('/proxy/soap/reports/active-loans', params)
        return response.data
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

