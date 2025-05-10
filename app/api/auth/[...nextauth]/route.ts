import NextAuth, { Session } from "next-auth";
import User from "@/models/user";
import connectToDatabase from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import Github from "next-auth/providers/github"
import Google from "next-auth/providers/google"


const handler = NextAuth({
    session: {
        strategy: "jwt",
    },
    providers: [
        Github({
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string
        }),
        Google({
            clientId: process.env.AUTH_GOOGLE_ID as string,
            clientSecret: process.env.AUTH_GOOGLE_SECRET as string
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {},
                password: {}
            },
            async authorize(credentials: Record<'email' | 'password', string> | undefined) {
                try {
                    await connectToDatabase()
                    const user = await User.findOne({ email: credentials?.email })

                    if (!user) {
                        throw new Error("")
                    }

                    const isValidPassword = await bcrypt.compare(
                        credentials?.password ?? "", user.password as string
                    )
                    if (!isValidPassword) {
                        throw new Error("")
                    }
                    return user
                } catch (error) {
                    return null
                }
            }
        })
    ],
    callbacks: {

        async signIn({ account, profile }) {
            if (account?.provider === "github" || account?.provider === "google") {
                await connectToDatabase()
                const existingUser = await User.findOne({ email: profile?.email })
                if (!existingUser) {
                    await User.create({
                        name: profile?.name,
                        email: profile?.email,
                    })
                }
            }
            return true
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.email = user.email
            }
            return token
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            if (token) {
                session.user = {
                    email: token.email,
                    name: token.name,
                    image: token.picture
                }
            }
            return session
        },
    },

    pages: {
        signIn: "/sign-in"
    },
    secret: process.env.NEXTAUTH_SECRET

})

export { handler as GET, handler as POST }