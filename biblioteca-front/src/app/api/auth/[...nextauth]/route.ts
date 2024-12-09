import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import axios from 'axios'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const response = await axios.post('http://localhost:3000/auth/login', {
            email: credentials.email,
            password: credentials.password
          })

          const { access_token, user } = response.data

          if (access_token && user) {
            return {
              id: user.id,
              email: user.email,
              userType: user.userType,
              accessToken: access_token
            }
          }

          return null
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken
        token.userType = user.userType
      }
      return token
    },
    async session({ session, token }) {
      session.user.accessToken = token.accessToken
      session.user.userType = token.userType
      return session
    }
  },
  pages: {
    signIn: '/',
  },
})

export { handler as GET, handler as POST }

