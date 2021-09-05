import { Reference } from '@apollo/client'
import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import { Box, IconButton } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import { PaginatedPosts, useDeletePostMutation, useMeQuery } from '../generated/graphql'

interface PostEditDeleteButtonProps{
    postId: string,
    postUserId: string
}

export const PostEditDeleteButton = ({
    postId, 
    postUserId
}: PostEditDeleteButtonProps) => {
    const router=useRouter()
    const {data: meData}=useMeQuery()
    const [deletePost,_] =useDeletePostMutation()

    const onPostDelete=async(postId: string)=>{
        await deletePost({
            variables: {id: postId},
            update(cache, {data}){
                if(data?.deletePost.success){
                    cache.modify({
                        fields: {
                            posts(existing:Pick<PaginatedPosts,
                                '__typename' |'cursor' |'hasMore' |'totalCount'
                                > & {paginatedPosts: Reference[]} ){
                                    const newPostAfterDeletion={
                                        ...existing,
                                        totalCount:existing.totalCount -1,
                                        paginatedPosts: existing.paginatedPosts.filter(
                                            postRefObject=>postRefObject.__ref !==`Post:${postId}`
                                        )
                                    }
                                    return newPostAfterDeletion
                                }
                        }
                    })
                }
            }
        })
        if (router.route !=='/') router.push('/')
    }
    if (meData?.me?.id !==postUserId) return null
    return (
        <Box>
            <NextLink href={`/post/edit/${postId}`}>
                    <IconButton 
                        icon={<EditIcon />} 
                        aria-label='edit'
                        mr={4}
                    />
            </NextLink>
                    <IconButton 
                        icon={<DeleteIcon />}
                        aria-label="delete"
                        colorScheme='red'
                        onClick={onPostDelete.bind(this, postId)}
                    />
        </Box>
    )
}
