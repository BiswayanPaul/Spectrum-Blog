import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, verify } from "hono/jwt";
import { createBlogInput, updateBlogInput } from "@biswayanpaul/spectrum-common";
import z from "zod";

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string
        JWT_SECRET: string
    },
    Variables: {
        userId: string
    }
}>();

const signupInputs = z.object({
    username: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional()
})


blogRouter.use("/*", async (c, next) => {
    // extract userid and pass to the router handler
    try {
        const authHeader = c.req.header('authorization') || "";
        const user = await verify(authHeader, c.env.JWT_SECRET);

        if (user) {
            c.set("userId", user.id);
        } else {
            c.status(403)
            return c.json({
                msg: "You are not logged in"
            })
        }

        await next();
    }
    catch (e) {
        c.status(403);
        return c.json({
            msg: "Internal Problem"
        })
    }

})


blogRouter.get('/bulk', async (c) => {

    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate())


    const blogs = await prisma.blog.findMany();

    return c.json({
        blogs
    })
})

blogRouter.get('/:id', async (c) => {

    const id = c.req.param("id");

    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
        const blog = await prisma.blog.findFirst({
            where: {
                id: Number(id)
            }
        })

        return c.json({
            id: blog
        })
    }
    catch (e) {
        c.status(411)
        return c.json({
            msg: "Error while fetching blog post"
        })
    }

})


blogRouter.post('/', async (c) => {
    const body = await c.req.json();

    const success = createBlogInput.safeParse(body);
    if (!success) {
        c.status(411);
        return c.json({
            msg: "Inputs are not correct"
        })
    }

    const authorId = c.get("userId")
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate())

    const blog = await prisma.blog.create({
        data: {
            title: body.title,
            content: body.content,
            authorId: Number(authorId),
        }
    })

    return c.json({
        id: blog.id
    })
})

blogRouter.put('/', async (c) => {
    const body = await c.req.json();

    const success = updateBlogInput.safeParse(body);

    if (!success) {
        c.status(411);
        return c.json({
            msg: "inputs are not correct"
        })
    }


    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
        const blog = await prisma.blog.update({
            where: {
                id: body.id
            },
            data: {
                title: body.title,
                content: body.content
            }
        })

        return c.json({
            id: blog.id
        })
    } catch (e) {
        console.log(e);
        c.json({
            msg: "Blog not created yet"
        })
    }

})