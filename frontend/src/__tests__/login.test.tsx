import React from "react";
import {
    render,
    screen,
    fireEvent,
    waitFor,
} from "@testing-library/react";
import { Provider } from "react-redux";

import { store } from "@/store/store";
import {
    initializeAuth,
    logout,
} from "@/store/authSlice";

import LoginPage from "@/app/login/page";
import { login } from "@/services/authService";


/*
 * Mock Next.js router
 */
const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockPush,
        replace: mockReplace,
    }),
}));

/*
 * Mock authentication service
 */
jest.mock("@/services/authService", () => ({
    login: jest.fn(),
}));

/*
 * Mock PublicRoute
 *
 * We are testing LoginPage here,
 * so we don't need to test PublicRoute again.
 */
jest.mock("@/components/PublicRoute", () => ({
    __esModule: true,
    default: ({
        children,
    }: {
        children: React.ReactNode;
    }) => <>{children}</>,
}));

describe("Login Page", () => {
    beforeEach(() => {
        /*
         * Reset mocks before every test
         */
        jest.clearAllMocks();

        /*
         * Reset Redux authentication state
         */
        store.dispatch(logout());
        store.dispatch(initializeAuth());

        /*
         * Clear browser storage
         */
        localStorage.clear();
    });

    test("renders the login page", () => {
        render(
            <Provider store={store}>
                <LoginPage />
            </Provider>
        );

        expect(
            screen.getByRole("heading", {
                name: "Sign in",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Email address")
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Password")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: "Sign in",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByText("Forgot password?")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Create an account")
        ).toBeInTheDocument();
    });

    test("shows validation errors for invalid input", async () => {
        render(
            <Provider store={store}>
                <LoginPage />
            </Provider>
        );

        const emailInput =
            screen.getByLabelText("Email address");

        const passwordInput =
            screen.getByLabelText("Password");

        fireEvent.change(emailInput, {
            target: {
                value: "invalid-email",
            },
        });

        fireEvent.change(passwordInput, {
            target: {
                value: "123",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: "Sign in",
            })
        );

        expect(
            await screen.findByText(
                "Please enter a valid email address"
            )
        ).toBeInTheDocument();

        expect(
            await screen.findByText(
                "Password must be at least 8 characters"
            )
        ).toBeInTheDocument();

        /*
         * Login API should NOT be called
         * when validation fails.
         */
        expect(login).not.toHaveBeenCalled();
    });

    test("logs in successfully and redirects to dashboard", async () => {
        /*
         * Mock successful backend login
         */
        jest.mocked(login).mockResolvedValue({
            token: "test-token",
            refreshToken: "test-refresh-token",
            username: "test@example.com",
            message: "Login Successful",
        });

        render(
            <Provider store={store}>
                <LoginPage />
            </Provider>
        );

        fireEvent.change(
            screen.getByLabelText("Email address"),
            {
                target: {
                    value: "test@example.com",
                },
            }
        );

        fireEvent.change(
            screen.getByLabelText("Password"),
            {
                target: {
                    value: "password123",
                },
            }
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Sign in",
            })
        );

        await waitFor(() => {
            expect(login).toHaveBeenCalledWith(
                "test@example.com",
                "password123"
            );
        });

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith(
                "/dashboard"
            );
        });

        /*
         * Check that tokens were stored
         */
        expect(
            localStorage.getItem("token")
        ).toBe("test-token");

        expect(
            localStorage.getItem("refreshToken")
        ).toBe("test-refresh-token");

        expect(
            localStorage.getItem("username")
        ).toBe("test@example.com");
    });

   test("shows error message when login fails", async () => {
    /*
     * Mock a 401 Axios error
     */
    jest.mocked(login).mockRejectedValue({
        isAxiosError: true,
        response: {
            status: 401,
        },
    });

    render(
        <Provider store={store}>
            <LoginPage />
        </Provider>
    );

    fireEvent.change(
        screen.getByLabelText("Email address"),
        {
            target: {
                value: "test@example.com",
            },
        }
    );

    fireEvent.change(
        screen.getByLabelText("Password"),
        {
            target: {
                value: "wrongpassword",
            },
        }
    );

    fireEvent.click(
        screen.getByRole("button", {
            name: "Sign in",
        })
    );

    expect(
        await screen.findByText(
            "Invalid email or password. Please check your credentials and try again."
        )
    ).toBeInTheDocument();

    expect(mockPush).not.toHaveBeenCalled();
});
test("shows rate limit message when login returns 429", async () => {
    jest.mocked(login).mockRejectedValue({
        isAxiosError: true,
        response: {
            status: 429,
            data: {
                retryAfterSeconds: 10,
            },
            headers: {},
        },
    });

    render(
        <Provider store={store}>
            <LoginPage />
        </Provider>
    );

    fireEvent.change(
        screen.getByLabelText("Email address"),
        {
            target: {
                value: "test@example.com",
            },
        }
    );

    fireEvent.change(
        screen.getByLabelText("Password"),
        {
            target: {
                value: "password123",
            },
        }
    );

    fireEvent.click(
        screen.getByRole("button", {
            name: "Sign in",
        })
    );

    expect(
        await screen.findByText(
            /Too many login attempts/i
        )
    ).toBeInTheDocument();
});

test("shows service unavailable message when login returns 503", async () => {
    jest.mocked(login).mockRejectedValue({
        isAxiosError: true,
        response: {
            status: 503,
            data: {
                message: "Login service is temporarily unavailable",
            },
        },
    });

    render(
        <Provider store={store}>
            <LoginPage />
        </Provider>
    );

    fireEvent.change(
        screen.getByLabelText("Email address"),
        { target: { value: "test@example.com" } }
    );

    fireEvent.change(
        screen.getByLabelText("Password"),
        { target: { value: "password123" } }
    );

    fireEvent.click(
        screen.getByRole("button", { name: "Sign in" })
    );

    expect(
        await screen.findByText(
            /Login service is temporarily unavailable/i
        )
    ).toBeInTheDocument();

    expect(mockPush).not.toHaveBeenCalled();
});
});