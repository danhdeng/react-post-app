import { Flex, Spinner, useToast } from '@chakra-ui/react'
import { FormikHelpers } from 'formik'
import { useRouter } from 'next/router'
import React from 'react'
import { MeDocument, MeQuery, RegisterInput, useRegisterMutation } from '../generated/graphql'
import { mapFieldErrors } from '../helpers/mapFieldErrors'
import { useCheckAuth } from '../utils/useCheckAuth'


export default function register() {
    const router =useRouter()

    const {userData: authData, loading: authloading} =useCheckAuth()
    
    const initialValues: RegisterInput ={username: '',email: '',password:''}

    const [registerUser, {loading: _registerUserLoading, error}]=useRegisterMutation()

    const toast =useToast()

    const onRegisterSubmit=async(
        values: RegisterInput,
        {setErrors}: FormikHelpers<RegisterInput>
    )=>{
        const response=await registerUser({
            variables:{
                registerInput: values
            },
            update(cache,{data}){
                if(data?.register.success){
                    cache.writeQuery<MeQuery>({
                        query: MeDocument,
                        data:{me: data.register.data}
                    })
                }
            }
        })
        if(response.data?.register.errors){
            setErrors(mapFieldErrors(response.data?.register.errors))
        }
        else if(response.data?.register.user){
            toast({
                title:'Welcome',
                description:'${response.data.register.user.username}',
                status:'success',
                duration:3000,
                isClosable: true
            })
            router.push('/')
        }
    }

    return (
       <> 
        {authloading|| (!authloading && authData?.me)?(
            <Flex justifyContent='center' alignItems='center' minH='100vh'>
                    <Spinner />
            </Flex>    
        ):(
            
        )
        }   
       </>    
    )
}
