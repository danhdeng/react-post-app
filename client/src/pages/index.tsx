import { Layout } from "../components/Layout"
import { PostsDocument, usePostsQuery } from "../generated/graphql"
import { addApolloState, initializeApollo } from "../lib/apolloClient"
const Index = () => {
    const {data, loading}=usePostsQuery({variables: {limit}})
    return(
    <Layout>
      {loading ? 'LOADING....' :(
        <ul>
          {
            data?.posts?.paginatedPosts.map(post =>(
            <li>{post.title}</li>
          ))}
        </ul>
      )}
    </Layout>
  )
}
export const limit=3

export async function getStaticProps() {
  const apolloClient = initializeApollo()

  await apolloClient.query({
    query: PostsDocument,
    variables: {
      limit
    },
  })

  return addApolloState(apolloClient, {
    props: {},
  })
}

export default Index
