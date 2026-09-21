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

        password: z
            .string()
            .min(8, {
                error: "Password must be at least 8 characters",
            })
            .regex(/[A-Z]/, {
                error: "Password must contain at least one uppercase letter",
            })
            .regex(/[a-z]/, {
                error: "Password must contain at least one lowercase letter",
            })
            .regex(/[0-9]/, {
                error: "Password must contain at least one number",
            })
            .regex(/[^A-Za-z0-9]/, {
                error: "Password must contain at least one special character",
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