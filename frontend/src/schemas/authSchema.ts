import { z } from "zod";

export const loginSchema = z.object({
    email: z.email({
        error: "Please enter a valid email address",
    }),

    password: z.string().min(8, {
        error: "Password must be at least 8 characters",
    }),
});

export const registerSchema = z
    .object({
        email: z.email({
            error: "Please enter a valid email address",
        }),

        password: z.string().min(8, {
            error: "Password must be at least 8 characters",
        }),

        confirmPassword: z.string().min(1, {
            error: "Please confirm your password",
        }),
    })
    .refine(
        (data) => data.password === data.confirmPassword,
        {
            path: ["confirmPassword"],
            error: "Passwords do not match",
        }
    );


export const forgotPasswordSchema = z.object({
    email: z.email({
        error: "Please enter a valid email address",
    }),
});