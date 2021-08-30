import { Field, InterfaceType } from "type-graphql";
import { FieldError } from "./FieldError";

@InterfaceType()
export abstract class IMutationResponse {
	@Field()
	code: number

    @Field()
    success: boolean

	@Field({nullable: true})
	message?: string

    @Field(_type => [FieldError],{nullable: true})
    errors?: FieldError[]

}