// console.log('Whazzap from Fastify_tutorial ...')

import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import userRoutes from "./modules/users/user.route";
import productRoutes from "./modules/products/product.route";
import { userSchemas } from "./modules/users/user.schema";
import { productSchemas } from "./modules/products/product.schema";
// import fastifyJwt from "fastify-jwt";
import fastifyJwt from "@fastify/jwt";
import swagger from "@fastify/swagger";
import { withRefResolver } from "fastify-zod";
import { version } from "../package.json"

export const server = Fastify();

declare module "fastify" {
    export interface FastifyInstance {
        authenticate: any;
    }
}

declare module "@fastify/jwt" {
    export interface FastifyJWT {
        user: {
            "id": number,
            "email": string,
            "name": string,
        };
    }
}

const port = 3000;

server.register(fastifyJwt, {
    secret: "asdf3ldskaj987asdthasd9087kh", // random inputs from me
});

server.decorate(
    "authenticate", 
    async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await request.jwtVerify();
        } catch (e) {
            return reply.send(e);
        }
})

server.get('/healthcheck', async function(){
    // 16:38; Unlike Express, Fastify *doesn't* require you to call 'response' or use .send ... function(request, response) etc
    return {status: "OK"};
});

async function main() {
    for(const schema of [...userSchemas, ...productSchemas]){
        server.addSchema(schema);
    };

    // Note: need to register schemas before routes, so we've added them above

    server.register(userRoutes, {prefix: 'api/users'});
    server.register(productRoutes, {prefix: 'api/products'});
    // server.register(
    //     swagger, 
    //     withRefResolver({
    //         routePrefix: '/docs',
    //         exposeRoute: true,
    //         staticCSP: true,
    //         openapi: {
    //             info:{
    //                 title: 'Fastify API',
    //                 description: 'API for some products',
    //                 version,
    //             }
    //         }
    //     })
    // );

    try {
        await server.listen(port, '0.0.0.0'); // '0.0.0.0' is a docker-specific addition, as it expects *this* to be the local host
        console.log(`Server ready at http://localhost:3000`);
    } catch(e) {
        console.error(e);
        process.exit(1);
    };
}

main();