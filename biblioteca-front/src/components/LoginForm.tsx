'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import axiosInstance from '@/lib/axios'
import { useToast } from '@/hooks/use-toast'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpenIcon } from '@heroicons/react/24/solid'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const { toast } = useToast()
  const setAuth = useStore(state => state.setAuth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await axiosInstance.post('/auth/login', { email, password })
      const { access_token, user } = response.data
      setAuth(access_token, {
        id: user.id,
        email: user.email,
        name: user.name || '',
        userType: user.userType
      })
      router.push('/dashboard/books')
    } catch (error) {
      toast({
        title: "Error",
        description: "Credenciales inválidas",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="w-screen h-screen flex overflow-hidden bg-gray-800">
      {/* Columna izquierda con imagen */}
      <div 
        className="hidden md:flex w-1/2 h-full bg-cover bg-center" 
        style={{ backgroundImage: 'url("/library.png")' }}
      >
        <div className="w-full h-full bg-gray-900 bg-opacity-40"></div>
      </div>
      
      {/* Columna derecha con el formulario */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-[350px] bg-gray-700 border border-gray-600 shadow-md rounded-lg text-gray-300">
          <CardHeader className="flex flex-col space-y-2">
            <CardTitle className="flex items-center text-2xl font-semibold text-gray-300">
              <BookOpenIcon className="w-8 h-8 text-indigo-500 mr-2" />
              Iniciar sesión
            </CardTitle>
            <CardDescription className="text-sm text-gray-400">
              Ingresa tus credenciales para acceder a la biblioteca
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="email" className="text-gray-400 font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="ejemplo@correo.com"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="password" className="text-gray-400 font-medium">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="********"
                />
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex items-center justify-between pt-4">
            <Button
              type="submit"
              onClick={handleSubmit}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-4 py-2 rounded-md transition-colors duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
            >
              Ingresar
            </Button>
            <a href="#" className="text-sm text-gray-400 hover:text-white">
              ¿Olvidaste tu contraseña?
            </a>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
