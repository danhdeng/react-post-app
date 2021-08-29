import { Query, Resolver } from "type-graphql";

@Resolver()
export class HelloResolver {
  @Query((_returns) => String)
  getHello() {
    return "Hello Resolver";
  }
}
