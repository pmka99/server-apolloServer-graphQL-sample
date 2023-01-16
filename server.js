const mongoose=require('mongoose')
const express=require('express')
const ApolloServer=require('@apollo/server')
const expressMiddleware= require('@apollo/server/express4')
const cors =require('cors')
const bodyParser =require('body-parser')
const http =require('http')
const ApolloServerPluginDrainHttpServer= require('@apollo/server/plugin/drainHttpServer')

const UserModel=require('./models/user')

// inset schema
const schema= require('./schema')
const resolvers=schema.resolvers
const typeDefs=schema.typeDefs

// DB connection
mongoose.connect('mongodb://localhost:27017/test')
.then(()=>console.log("connect to db"))
.catch((err)=>console.log(err))
mongoose.Promise= global.Promise;
///////

const app=express()
const httpServer = http.createServer(app);

async function main(){
    const server = new ApolloServer.ApolloServer({
    typeDefs,
    resolvers,
    //   plugins: [ApolloServerPluginDrainHttpServer.ApolloServerPluginDrainHttpServer({ httpServer })],
    });

    await server.start();

    app.use(
    '/',
    cors(),
    bodyParser.json(),
    expressMiddleware.expressMiddleware(server, {
        context: async ({ req }) => {
            let api_secret_key = "aH454E#GT#$Tggf@E" ;
            let user= await UserModel.checkToken(req,api_secret_key)
            return {user , api_secret_key}
        }
    }),
    );

    await new Promise((resolve) => httpServer.listen({ port: 3000 }, resolve));
}
main()