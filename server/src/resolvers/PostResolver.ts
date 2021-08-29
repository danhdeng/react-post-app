import { Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {
  @Query((_returns) => String)
  getPost() {
    return "Post";
  }
}
