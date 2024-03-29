import { Box, Button, Flex, Link, Spinner, useToast } from '@chakra-ui/react'
import { Form, Formik, FormikHelpers } from 'formik'
import { useRouter } from 'next/router'
import React from 'react'
import { InputField } from '../components/InputField'
import { Layout } from '../components/Layout'
import { Wrapper } from '../components/Wrapper'
import { LoginInput, MeDocument, MeQuery, useLoginMutation } from '../generated/graphql'
import { mapFieldErrors } from '../helpers/mapFieldErrors'
import { initializeApollo } from '../lib/apolloClient'
import { useCheckAuth } from '../utils/useCheckAuth'
import NextLink from 'next/link'

export default function Login() {
    const router = useRouter()

    const { data: authData, loading: authLoading } = useCheckAuth()

    const initialValues: LoginInput = { usernameOrEmail: '', password: '' }

    const [login, { loading: _loginUserLoading, error }] = useLoginMutation()

    const toast = useToast()

    const onloginSubmit = async (
        values: LoginInput,
        { setErrors }: FormikHelpers<LoginInput>
    ) => {
        const response = await login({
            variables: {
                loginInput: values
            },
            update(cache, { data }) {
                if (data?.login.success) {
                    cache.writeQuery<MeQuery>({
                        query: MeDocument,
                        data: { me: data.login.user }
                    })

                }
            }
        })
        if (response.data?.login.errors) {
            setErrors(mapFieldErrors(response.data?.login.errors))
        }
        else if (response.data?.login.user) {
            toast({
                title: 'Welcome',
                description: `${response.data.login.user.username}`,
                status: 'success',
                duration: 3000,
                isClosable: true
            })
            const apolloClient = initializeApollo()
            apolloClient.resetStore()
            router.push('/')
        }
    }

    return (
        <>
            {authLoading || (!authLoading && authData?.me) ? (
                <Flex justifyContent='center' alignItems='center' minH='100vh'>
                    <Spinner />
                </Flex>
            ) : (
                <Layout>
                    <Wrapper size='small'>
                        {error && <p>Failed to login. Internal server error</p>}
                        <Formik initialValues={initialValues} onSubmit={onloginSubmit}>
                            {({ isSubmitting }) => (
                                <Form>
                                    <InputField
                                        name='usernameOrEmail'
                                        placeholder='usernameOrEmail'
                                        label='username'
                                        type='text'
                                    />
                                    <Box mt={4}>
                                        <InputField
                                            name='password'
                                            placeholder='password'
                                            label='password'
                                            type='password'
                                        />
                                    </Box>
                                    <Flex mt={2}>
                                        <NextLink href='/forgot-password'>
                                            <Link ml='auto'>forget password</Link>
                                        </NextLink>
                                    </Flex>
                                    <Button
                                        type='submit'
                                        colorScheme='teal'
                                        mt={4}
                                        isLoading={isSubmitting}
                                    >
                                        Login
                                    </Button>
                                </Form>
                            )
                            }
                        </Formik>
                    </Wrapper>
                </Layout>
            )}
        </>
    )
}

