'use client'

import React, { createContext, useContext } from 'react'
import { User, TipoUsuario } from '@/types/user'

interface UserContextType {
    user: User | null
    tipoUsuario: TipoUsuario | 'convidado'
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children, user }: { children: React.ReactNode, user: User | null }) {
    const tipoUsuario = user?.tipo || 'convidado'

    return (
        <UserContext.Provider value={{ user, tipoUsuario }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error('useUser deve ser usado dentro de um UserProvider')
    }
    return context
}
