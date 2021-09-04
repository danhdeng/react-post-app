import { Flex, Spinner, Box, Button } from '@chakra-ui/react'
import { Formik, Form } from 'formik'
import router from 'next/router'
import React from 'react'
import { InputField } from '../components/InputField'
import { Layout } from '../components/Layout'
import { CreatePostInput, useCreatePostMutation } from '../generated/graphql'
import { useCheckAuth } from '../utils/useCheckAuth'
import NextLink from 'next/link'

export default function CreatePost() {
    const { data: authData, loading: authLoading } = useCheckAuth()

    const initialValues = { title: '', text: '' }

    const [createPost, _] = useCreatePostMutation()

    const onCreatePostSubmit = async (values: CreatePostInput) => {
        await createPost({
            variables: { createPostInput: values },
            update(cache, { data }) {
                cache.modify({
                    fields: {
                        posts(existing) {
                            if (data?.createPost.success && data.createPost.post) {
                                //Post: new_id
                                const newPostRef = cache.identify(data.createPost.post)

                                const newPostAfterCreation = {
                                    ...existing,
                                    totalCount: existing.totalCount + 1,
                                    paginatedPosts: [
                                        { __ref: newPostRef },
                                        ...existing.paginatedPosts
                                    ]
                                }
                                return newPostAfterCreation
                            }
                        }
                    }
                })
            }
        })
        router.push('/')
    }
    if (authLoading || (!authLoading && !authData?.me)) {
        return (
            <Flex justifyContent='center' alignItems='center' minH='100vh'>
                <Spinner />
            </Flex>
        )
    } else {
        return (
            <Layout>
                <Formik initialValues={initialValues} onSubmit={onCreatePostSubmit}>
                    {({ isSubmitting }) => (
                        <Form>
                            <InputField
                                name='title'
                                placeholder='title'
                                label='Title'
                                type='text'
                            />
                            <Box mt={4}>
                                <InputField
                                    textarea
                                    name='text'
                                    placeholder='text'
                                    label='Text'
                                    type='textarea'
                                />
                            </Box>
                            <Flex justifyContent='space-between' alignItems='center' mt={4}>
                                <Button
                                    type="submit"
                                    colorSchema='teal'
                                    isLoading={isSubmitting}
                                >
                                    Create Post
                                </Button>
                                <NextLink href='/'>
                                    <Button>Go back to HomePage</Button>
                                </NextLink>
                            </Flex>
                        </Form>
                    )
                    }
                </Formik>
            </Layout>
        )
    }

}
