import z from "zod"

export const signupInputs = z.object({
    username: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional()
})

export const signinInputs = z.object({
    username: z.string().email(),
    password: z.string().min(6),
})

export const createBlogInput = z.object({
    title: z.string(),
    content: z.string()
})

export const updateBlogInput = z.object({
    title: z.string(),
    content: z.string(),
    id: z.number()
})


export type CreateBlogInput = z.infer<typeof createBlogInput>
export type SigninInput = z.infer<typeof signinInputs>
export type SignupInput = z.infer<typeof signupInputs>
export type UpdateBlogInput = z.infer<typeof updateBlogInput>
