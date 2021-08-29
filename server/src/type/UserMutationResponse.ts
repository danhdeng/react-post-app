import { ImutationResponse } from '.MutationResponse';
import { User } from 'src/entities/User';
import { Field, ObjectType } from 'type-graphql';
import { FieldError } from './FieldError';


@ObjectType({implements: ImutationResponse})
export class UserMutationResponse implements ImutationResponse {
    code: number
    success: boolean
    message?: string
    error?: FieldError[]

    @Field({nullable: true})
    user?: User
}