import { Box, Button, Flex, Spinner, useToast } from '@chakra-ui/react'
import { Form, Formik, FormikHelpers } from 'formik'
import { useRouter } from 'next/router'
import React from 'react'
import { InputField } from '../components/InputField'
import { Wrapper } from '../components/Wrapper'
import { MeDocument, MeQuery, RegisterInput, useRegisterMutation } from '../generated/graphql'
import { mapFieldErrors } from '../helpers/mapFieldErrors'
import { useCheckAuth } from '../utils/useCheckAuth'


export default function Register() {
    const router =useRouter()

    const {data: authData, loading: authloading} =useCheckAuth()
    
    const initialValues: RegisterInput ={username: '',email: '',password:'', confirmedPassword:''}

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
                        data:{me: data.register.user}
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
            <Wrapper size='small'>
                {error && <p>Failed to register. Internal server error</p>}
                <Formik initialValues={initialValues} onSubmit={onRegisterSubmit}>
                    {({isSubmitting})=>(
                            <Form>
                                <InputField
                                    name='username'
                                    placeholder='username'
                                    label='username'
                                    type='text'
                                />
                                <Box mt={4}>
                                    <InputField 
                                        name='email'
                                        placeholder='email'
                                        label='email'
                                        type='email'
                                    />
                                </Box>
                                <Box mt={4}>
                                    <InputField 
                                        name='password'
                                        placeholder='password'
                                        label='password'
                                        type='password'
                                    />
                                </Box>
                                <Box mt={4}>
                                    <InputField 
                                        name='confirmedPassword'
                                        placeholder='confirmed Password'
                                        label='confirmed Password'
                                        type='password'
                                    />
                                </Box>
                                <Button 
                                    type='submit'
                                    colorScheme='teal'
                                    mt={4}
                                    isLoading={isSubmitting}
                                >
                                    Register
                                </Button>
                            </Form>
                        )
                    }
                </Formik>
            </Wrapper>
        )}   
       </>    
    )
}
