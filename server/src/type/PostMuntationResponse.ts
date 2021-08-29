import { Post } from 'src/entities/Post';
import { Field, ObjectType } from 'type-graphql';
import { FieldError } from './FieldError';
import { ImutationResponse } from './MutationResponse';


@ObjectType({implements: ImutationResponse})
export class PostMutationResponse implements ImutationResponse {
    code: number
    success: boolean
    message?: string
    error?: FieldError[]

    @Field({nullable: true})
    post?: Post
}