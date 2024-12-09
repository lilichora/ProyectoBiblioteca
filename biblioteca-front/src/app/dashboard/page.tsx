import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"

export default async function Dashboard() {
  const session = await getServerSession()

  if (!session) {
    redirect('/')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Bienvenido al Dashboard</h1>
      {/* Aquí puedes agregar contenido específico del dashboard */}
    </div>
  )
}

