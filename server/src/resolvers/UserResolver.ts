import { Query, Resolver } from "type-graphql";

@Resolver()
export class UserResolver {
  @Query((_returns) => String)
  getUser() {
    return "User";
  }
}
