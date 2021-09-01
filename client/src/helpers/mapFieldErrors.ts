import { FieldError } from '../generated/graphql'


export const mapFieldErrors = (
        errors:FieldError[]
):{[key: string]: string} => {
    return (
        errors.reduce(
            (accumulatedErrorObj, error)=>({
                ...accumulatedErrorObj,
                [error.field]: error.message
            }),{})
    )
}
