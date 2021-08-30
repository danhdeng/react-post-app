import { buildDataLoaders } from './utils/dataLoaders';
require("dotenv").config();
// import Mongoose  from "mongoose";
import { ApolloServerPluginLandingPageGraphQLPlayground, Context } from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import MongoStore from "connect-mongo";
import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { COOKIE_NAME, __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { Upvote } from './entities/Upvote';
import { User } from "./entities/User";
import { HelloResolver } from "./resolvers/helloResolver";
import { PostResolver } from "./resolvers/postResolver";
import { UserResolver } from "./resolvers/userResolver";

const main = async () => {
  const connection = await createConnection({
    type: "postgres",
    host: 'localhost',
    port: 5432,
    database: "reddit",
    username: process.env.DB_USERNAME_DEV,
    password: process.env.DB_PASSWORD,
    logging: true,
    synchronize: true,
    entities: [User, Post, Upvote],
  });

  const app = express();

  // Session/Cookie store
  const mongoUrl = `mongodb+srv://${process.env.SESSION_DB_USERNAME_DEV_PROD}:${process.env.SESSION_DB_PASSWORD_DEV_PROD}@${process.env.MONGODB_HTTP_ADDRESS}`;
  mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    // server: {
    //     poolSize: Number(process.env.POOL_SIZE!)
    // }
  })
    .then(() => {
      console.log(
        'Connected to Distribution API Database - Initial Connection'
      );
    })
    .catch((err) => {
      console.log(
        `Initial Distribution API Database connection error occured -`,
        err
      );
    });
  app.set('trust proxy', 1)

  app.use(
    session({
      name: COOKIE_NAME,
      store: MongoStore.create({ mongoUrl }),
      cookie: {
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
        secure: __prod__,
        sameSite: "lax",
      },
      secret: process.env.SESSION_SECRET_DEV_PROD as string,
      saveUninitialized: false,
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, PostResolver, HelloResolver],
      validate: false,
    }),
    context: ({ req, res }): Context => ({
      req,
      res,
      connection,
      dataloaders: buildDataLoaders()
    }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app, cors: false });

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`server is started on port : ${port}`);
  });
};

main().catch((err) => console.log(err));
