import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useMeQuery } from '../generated/graphql'

export const useCheckAuth = () => {
    const router = useRouter()
    const { data, loading } = useMeQuery()

    useEffect(() => {
        console.log('Route: ', router.route)
        if (!loading) {
            if (data?.me && (router.route === '/login'
                || router.route === '/register')
            ) {
                router.replace('/')
            }
            else if (!data?.me && (router.route !== '/login'
                && router.route !== '/register'
                && router.route !== '/forgot-password'
                && router.route !== '/change-password')
            ) {
                console.log('Route: ', router.route)
                router.replace('/login')
            }
        }
    }, [data, loading, router])
    return (
        { data, loading }
    )
}
