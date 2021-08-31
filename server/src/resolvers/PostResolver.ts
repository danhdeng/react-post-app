import { UserInputError } from 'apollo-server-core';
import { Arg, Ctx, FieldResolver, ID, Int, Mutation, Query, registerEnumType, Resolver, Root, UseMiddleware } from "type-graphql";
import { LessThan } from 'typeorm';
import { Post } from '../entities/Post';
import { User } from '../entities/User';
import { checkAuth } from '../middleware/checkAuth';
import { Context } from '../types/Context';
import { CreatePostInput } from '../types/CreatePostInput';
import { PostMutationResponse } from '../types/PostMutationResponse';
import { VoteType } from '../types/VoteType';
import { Upvote } from './../entities/Upvote';
import { PaginatedPosts } from './../types/PaginatedPosts';
import { UpdatePostInput } from './../types/UpdatePostInput';

registerEnumType(VoteType, {
  name: 'VoteType'
})
@Resolver(_of => Post)
export class PostResolver {
  @FieldResolver(_return => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50)
  }

  @FieldResolver(_return => User)
  async user(
    @Root() root: Post,
    @Ctx() { dataLoaders: { userLoader } }: Context
  ) {
    return await userLoader.load(root.userId)
  }

  @FieldResolver(_return => Int)
  async voteType(
    @Root() root: Post,
    @Ctx() { req, dataLoaders: { voteTypeLoader } }: Context
  ) {
    if (!req.session.userId) return 0

    const existingVote = await voteTypeLoader.load({
      postId: root.id,
      userId: req.session.userId
    })
    return existingVote ? existingVote.value : 0
  }

  @Mutation(_return => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async createPost(
    @Arg('createPostInput') { title, text }: CreatePostInput,
    @Ctx() { req }: Context
  ): Promise<PostMutationResponse> {
    try {
      const newPost = Post.create({
        title,
        text,
        userId: req.session.userId
      })
      await newPost.save()
      return {
        code: 200,
        success: true,
        message: 'Post created successfully',
        post: newPost
      }
    } catch (error) {
      console.log(error)
      return {
        code: 500,
        success: false,
        message: `Internal server error ${error.message}`
      }
    }
  }

  //return Post with pagination
  @Query(_return => PaginatedPosts, { nullable: true })
  async posts(
    @Arg('limit', _type => Int) limit: number,
    @Arg('cursor', { nullable: true }) cursor?: string
  ): Promise<PaginatedPosts | null> {
    try {
      const totalPostCount = await Post.count()
      const realLimit = Math.min(10, limit)
      const findOptions: { [key: string]: any } = {
        order: {
          createdAt: 'DESC'
        },
        take: realLimit
      }
      let lastPost: Post[] = []
      if (cursor) {
        findOptions.where = { createdAt: LessThan(cursor) }
        lastPost = await Post.find({
          order: {
            createdAt: 'ASC'
          },
          take: realLimit
        })
      }
      const posts = await Post.find(findOptions)
      return {
        totalCount: totalPostCount,
        cursor: posts[posts.length - 1].createdAt,
        hasMore: cursor
          ? posts[posts.length - 1].createdAt.toString() !==
          lastPost[0].createdAt.toString()
          : posts.length !== totalPostCount,
        paginatedPosts: posts
      }

    } catch (error) {
      console.log(error)
      return null
    }
  }

  //retrieve single post by id
  @Query(_return => Post, { nullable: true })
  async post(
    @Arg('id', _type => ID) id: number
  ): Promise<Post | undefined> {
    try {
      return await Post.findOne(id)
    } catch (error) {
      console.log(error)
      return undefined
    }
  }

  //update post by id and authorized user only
  @Mutation(_return => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async updatePost(
    @Arg('updatePostInput') { id, title, text }: UpdatePostInput,
    @Ctx() { req }: Context
  ): Promise<PostMutationResponse> {
    const existingPost = await Post.findOne(id)
    if (!existingPost)
      return {
        code: 400,
        success: false,
        message: "Post is not found"
      }
    if (existingPost.userId !== req.session.userId) {
      return {
        code: 401,
        success: false,
        message: "Unauthorized"
      }
    }
    existingPost.title = title
    existingPost.text = text
    await existingPost.save()

    return {
      code: 200,
      success: true,
      message: 'Post updated successfully',
      post: existingPost
    }
  }

  @Mutation(_return => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async deletePost(
    @Arg('id', _type => ID) id: number,
    @Ctx() { req }: Context
  ): Promise<PostMutationResponse> {
    const existingPost = await Post.findOne(id)
    if (!existingPost)
      return {
        code: 400,
        success: false,
        message: "Post is not found"
      }
    if (existingPost.userId !== req.session.userId) {
      return {
        code: 401,
        success: false,
        message: "Unauthorized"
      }
    }
    await Upvote.delete({ postId: id })
    await Post.delete({ id })
    return {
      code: 200,
      success: true,
      message: "Post deleted successfully"
    }
  }

  @Mutation(_return => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async vote(
    @Arg('postId', _type => Int) postId: number,
    @Arg('inputVoteValue', _type => VoteType) inputVoteValue: VoteType,
    @Ctx()
    {
      req: {
        session: { userId }
      },
      connection
    }: Context
  ): Promise<PostMutationResponse> {
    return await connection.transaction(async transactionEntityManager => {
      // check if post exists
      let post = await transactionEntityManager.findOne(Post, postId)
      if (!post) {
        throw new UserInputError('Post not found')
      }

      // check if user has voted or not
      const existingVote = await transactionEntityManager.findOne(Upvote, {
        postId,
        userId
      })

      if (existingVote && existingVote.value !== inputVoteValue) {
        await transactionEntityManager.save(Upvote, {
          ...existingVote,
          value: inputVoteValue
        })

        post = await transactionEntityManager.save(Post, {
          ...post,
          points: post.points + 2 * inputVoteValue
        })
      }

      if (!existingVote) {
        const newVote = transactionEntityManager.create(Upvote, {
          userId,
          postId,
          value: inputVoteValue
        })
        await transactionEntityManager.save(newVote)

        post.points = post.points + inputVoteValue
        post = await transactionEntityManager.save(post)
      }

      return {
        code: 200,
        success: true,
        message: 'Post voted',
        post
      }
    })
  }
}
