import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";

import { store } from "@/store/store";
import { login, initializeAuth } from "@/store/authSlice";

import DashboardPage from "@/app/dashboard/page";

jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
    }),
}));

jest.mock("@/services/authService", () => ({
    checkAuth: jest.fn(),
}));

describe("Dashboard Page", () => {
    beforeEach(() => {
        store.dispatch(
            login({
                token: "test-token",
                refreshToken: "test-refresh-token",
                username: "test@example.com",
            })
        );

        store.dispatch(initializeAuth());
    });

    test("renders dashboard page", () => {
        render(
            <Provider store={store}>
                <DashboardPage />
            </Provider>
        );

        expect(
            screen.getByRole("heading", {
                name: "Compliance Dashboard",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByText("Monitor your compliance health")
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: "Check Authentication",
            })
        ).toBeInTheDocument();
    });
});