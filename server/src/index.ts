require("dotenv").config();
// import Mongoose  from "mongoose";
import { ApolloServerPluginLandingPageGraphQLPlayground, Context } from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { HelloResolver } from "./resolvers/helloResolver";
import { PostResolver } from "./resolvers/postResolver";
import { UserResolver } from "./resolvers/userResolver";

const main = async () => {
  console.log(process.env.DB_USERNAME_DEV);
  await createConnection({
    type: "postgres",
    host: process.env.HOST,
    port: 5432,
    database: "reddit",
    username: process.env.DB_USERNAME_DEV,
    password: process.env.DB_PASSWORD,
    logging: true,
    synchronize: true,
    entities: [User, Post],
  });

  const app = express();

  // Session/Cookie store
  // const mongoUrl = `mongodb+srv://${process.env.SESSION_DB_USERNAME_DEV_PROD}:${process.env.SESSION_DB_PASSWORD_DEV_PROD}@${process.env.MONGODB_HTTP_ADDRESS}`;

  // app.use(
  //   session({
  //     name: COOKIE_NAME,
  //     store: MongoStore.create({ mongoUrl }),
  //     cookie: {
  //       maxAge: 1000 * 60 * 60,
  //       httpOnly: true,
  //       secure: __prod__,
  //       sameSite: "lax",
  //     },
  //     secret: process.env.SESSION_SECRET_DEV_PROD as string,
  //     saveUninitialized: false,
  //     resave: false,
  //   })
  // );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, PostResolver, HelloResolver],
      validate: false,
    }),
    context: ({ req, res }): Context => ({ req, res }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground],
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app, cors: false });

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`server is started on port : ${port}`);
  });
};

main().catch((err) => console.log(err));
