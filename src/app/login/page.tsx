import { redirect } from 'next/navigation'
import { getUsuarioLogado } from '@/actions/auth'
import { getRotaInicial } from '@/types/user'
import LoginClient from './LoginClient'

export default async function LoginPage() {
    const user = await getUsuarioLogado();

    if (user) {
        redirect(getRotaInicial(user.tipo));
    }

    return <LoginClient />
}
