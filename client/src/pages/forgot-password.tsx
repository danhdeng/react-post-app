import { Box, Flex, Link } from '@chakra-ui/layout'
import { Spinner } from '@chakra-ui/spinner'
import { Form, Formik } from 'formik'
import React from 'react'
import { InputField } from '../components/InputField'
import { Wrapper } from '../components/Wrapper'
import { ForgotPasswordInput, useForgotPasswordMutation } from '../generated/graphql'
import { useCheckAuth } from '../utils/useCheckAuth'
import NextLink from 'next/link'
import { Button } from '@chakra-ui/button'
import { Layout } from '../components/Layout'

export default function ForgotPassword() {
    const { data: authData, loading: authLoading } = useCheckAuth()
    const initialvalues = { email: '' }
    const [forgotPassword, { loading, data }] = useForgotPasswordMutation()

    const onForgotPasswordSubmit = async (values: ForgotPasswordInput) => {
        await forgotPassword({ variables: { forgotPasswordInput: values } })
    }
    if (authLoading || !authLoading && authData?.me) {
        return <Flex justifyContent='center' alignItems='center' minH='100vh'>
            <Spinner />
        </Flex>
    }
    else
        return (
            <Layout>
                <Wrapper size='small'>
                    <Formik initialValues={initialvalues} onSubmit={onForgotPasswordSubmit}>
                        {
                            ({ isSubmitting }) =>
                                !loading && data ? (
                                    <Box>Please check your in Box</Box>
                                ) : (
                                    <Form>
                                        <InputField
                                            name='email'
                                            placeholder='email'
                                            label='email'
                                            type='email'
                                        />
                                        <Flex mt={2}>
                                            <NextLink href='/login'>
                                                <Link ml='auto'>Back to Login</Link>
                                            </NextLink>
                                        </Flex>
                                        <Button type='submit'
                                            colorScheme='teal'
                                            mt={4}
                                            isLoading={isSubmitting}
                                        >
                                            Send Reset Password Email
                                        </Button>
                                    </Form>
                                )
                        }
                    </Formik>
                </Wrapper>
            </Layout>
        )
}
