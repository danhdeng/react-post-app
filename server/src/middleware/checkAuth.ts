import { AuthenticationError } from "apollo-server-errors";
import { MiddlewareFn } from "type-graphql";
import { Context } from "../types/Context";

export const checkAuth: MiddlewareFn<Context> = (
    { context: { req } },
    next
) => {
    if (!req.session.userId)
        throw new AuthenticationError(
            'Not authenticate to perform GraphQL operations'
        )
    return next()
}
