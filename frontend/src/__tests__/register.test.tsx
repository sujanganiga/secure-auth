import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";

import { store } from "@/store/store";
import { initializeAuth } from "@/store/authSlice";

import RegisterPage from "@/app/register/page";

jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
    }),
}));

describe("Register Page", () => {
    beforeEach(() => {
        store.dispatch(initializeAuth());
    });

    test("renders the register page", () => {
        render(
            <Provider store={store}>
                <RegisterPage />
            </Provider>
        );

        expect(
            screen.getByRole("heading", {
                name: "Create account",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Email address")
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Password")
        ).toBeInTheDocument();

        expect(
            screen.getByLabelText("Confirm password")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: "Create account",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByText("Already have an account?")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Sign in")
        ).toBeInTheDocument();
    });
});