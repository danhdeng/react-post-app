import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { Layout } from "../components/Layout"
import { PostsDocument, usePostsQuery } from "../generated/graphql"
import { addApolloState, initializeApollo } from "../lib/apolloClient"

export const limit = 3

const Index = () => {
  const { data, loading } = usePostsQuery({ variables: { limit } })
  console.log(data)
  return (
    <Layout>
      {loading ? 'LOADING....' : (
        <ul>
          {
            data?.posts?.paginatedPosts.map(post => (
              <li>{post.title}</li>
            ))}
        </ul>
      )}
    </Layout>
  )
}


// export async function getStaticProps() {
//   const apolloClient = initializeApollo()

//   await apolloClient.query({
//     query: PostsDocument,
//     variables: {
//       limit
//     },
//   })

//   return addApolloState(apolloClient, {
//     props: {},
//   })
// }
export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const apolloClient = initializeApollo({ headers: context.req.headers })

  await apolloClient.query({
    query: PostsDocument,
    variables: {
      limit
    }
  })

  return addApolloState(apolloClient, {
    props: {}
  })
}

export default Index
