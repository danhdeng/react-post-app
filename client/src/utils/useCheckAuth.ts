import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useMeQuery } from '../generated/graphql'

export const useCheckAuth = () => {
    const router = useRouter()
    const [userData, loading]=useMeQuery()

    useEffect(() => {
        if(!loading) {
            if(userData?.me && (router.route==='/login' || router.route==='/register' || router.route==='/forgot-password' || router.route==='/change-password') 
            ){
                router.replace('/')
            }else if(!userData?.me && (router.route==='/login' || router.route==='/register')
            ){
                router.replace('/login')
            }
        }
    }, [userData, loading, router])
    return (
        {userData, loading}
    )
}
