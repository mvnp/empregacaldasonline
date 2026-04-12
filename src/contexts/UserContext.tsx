'use client'

import React, { createContext, useContext } from 'react'
import { User, TipoUsuario } from '@/types/user'

export interface OnboardingStatus {
    perfilCompleto: boolean
    temCurriculo: boolean
}

interface UserContextType {
    user: User | null
    tipoUsuario: TipoUsuario | 'convidado'
    onboarding: OnboardingStatus | null
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({
    children,
    user,
    onboarding = null,
}: {
    children: React.ReactNode
    user: User | null
    onboarding?: OnboardingStatus | null
}) {
    const tipoUsuario = user?.tipo || 'convidado'

    return (
        <UserContext.Provider value={{ user, tipoUsuario, onboarding }}>
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
