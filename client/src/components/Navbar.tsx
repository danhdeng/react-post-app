import { Reference, gql } from "@apollo/client"
import { MeDocument, MeQuery, useLogoutMutation, useMeQuery } from "../generated/graphql"
import NextLink from 'next/link'
import { Link, Flex, Button, Box, Heading } from "@chakra-ui/react"
export const Navbar = () => {
    const { data, loading: useMeQueryLoading } = useMeQuery()

    const [logout, { loading: useLogoutMutationLoading }] = useLogoutMutation()

    const logoutUser = async () => {
        await logout({
            update(cache, { data }) {
                if (data?.logout) {
                    cache.writeQuery<MeQuery>({
                        query: MeDocument,
                        data: { me: null }
                    })
                    cache.modify({
                        fields: {
                            posts(existing) {
                                existing.paginatedPosts.forEach((post: Reference) => {
                                    cache.writeFragment({
                                        id: post.__ref,
                                        fragment: gql`
                                                fragment VoteType on Post{
                                                    voteType
                                                }`,
                                        data: {
                                            voteType: 0
                                        }
                                    })
                                })
                                return existing
                            }
                        }
                    })
                }
            }
        })
    }
    let body
    if (useMeQueryLoading) {
        body = null
    } else if (!data?.me) {
        body = (
            <>
                <NextLink href='/login'>
                    <Link mr={2}>Login</Link>
                </NextLink>
                <NextLink href='/register'>
                    <Link mr={2}>Register</Link>
                </NextLink>
            </>
        )
    } else {
        body = (
            <Flex>
                <NextLink href='/create-post'>
                    <Button mr={4}>Create Post</Button>
                </NextLink>
                <Button onClick={logoutUser} isLoading={useLogoutMutationLoading}>Logout</Button>
            </Flex>
        )
    }
    return (
        <Box bg='tan' p={4}>
            <Flex maxW={800} justifyContent='space-between' align='center' m='auto'>
                <NextLink href='/'>
                    <Heading>MyPosting</Heading>
                </NextLink>
                <Box>{body}</Box>
            </Flex>
        </Box>
    )
}
