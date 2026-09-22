import React from "react";
import {
    render,
    screen,
    fireEvent,
    act,
} from "@testing-library/react";
import { Provider } from "react-redux";

import DashboardPage from "@/app/dashboard/page";
import { store } from "@/store/store";
import {
    login,
    logout,
    initializeAuth,
} from "@/store/authSlice";

const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockPush,
        replace: mockReplace,
    }),
}));

jest.mock("@/services/authService", () => ({
    checkAuth: jest.fn(),
}));

describe("Dashboard Page", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        localStorage.clear();

        act(() => {
            store.dispatch(logout());

            store.dispatch(
                login({
                    token: "test-token",
                    refreshToken: "test-refresh-token",
                    username: "test@example.com",
                })
            );

            store.dispatch(initializeAuth());
        });
    });

    afterEach(() => {
        act(() => {
            store.dispatch(logout());
        });

        localStorage.clear();
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
    });

    test("renders HDFC Life logo", () => {
        render(
            <Provider store={store}>
                <DashboardPage />
            </Provider>
        );

        expect(
            screen.getAllByAltText("HDFC Life").length
        ).toBeGreaterThan(0);
    });

    test("renders profile menu button", () => {
        render(
            <Provider store={store}>
                <DashboardPage />
            </Provider>
        );

        expect(
            screen.getByRole("button", {
                name: "Open profile menu",
            })
        ).toBeInTheDocument();
    });

    test("renders menu button", () => {
        render(
            <Provider store={store}>
                <DashboardPage />
            </Provider>
        );

        expect(
            screen.getByRole("button", {
                name: "Close menu",
            })
        ).toBeInTheDocument();
    });

    test("renders Dashboard navigation link", () => {
        render(
            <Provider store={store}>
                <DashboardPage />
            </Provider>
        );

        expect(
            screen.getByRole("link", {
                name: "Dashboard",
            })
        ).toBeInTheDocument();
    });

    test("renders Policies navigation item", () => {
        render(
            <Provider store={store}>
                <DashboardPage />
            </Provider>
        );

        expect(
            screen.getByRole("button", {
                name: "Policies",
            })
        ).toBeInTheDocument();
    });

    test("renders Claims navigation item", () => {
        render(
            <Provider store={store}>
                <DashboardPage />
            </Provider>
        );

        expect(
            screen.getByRole("button", {
                name: "Claims",
            })
        ).toBeInTheDocument();
    });

    test("renders Reports navigation item", () => {
        render(
            <Provider store={store}>
                <DashboardPage />
            </Provider>
        );

        expect(
            screen.getByRole("button", {
                name: "Reports",
            })
        ).toBeInTheDocument();
    });

    test("renders AI Insights navigation item", () => {
        render(
            <Provider store={store}>
                <DashboardPage />
            </Provider>
        );

        expect(
            screen.getByRole("button", {
                name: "AI Insights",
            })
        ).toBeInTheDocument();
    });

    test("renders Settings navigation item", () => {
        render(
            <Provider store={store}>
                <DashboardPage />
            </Provider>
        );

        expect(
            screen.getByRole("button", {
                name: "Settings",
            })
        ).toBeInTheDocument();
    });

    test("renders authenticated username", () => {
        render(
            <Provider store={store}>
                <DashboardPage />
            </Provider>
        );

        expect(
            screen.getByText("test")
        ).toBeInTheDocument();
    });

    test("renders authenticated Redux state", () => {
        expect(
            store.getState().auth.isAuthenticated
        ).toBe(true);

        expect(
            store.getState().auth.token
        ).toBe("test-token");

        expect(
            store.getState().auth.refreshToken
        ).toBe("test-refresh-token");

        expect(
            store.getState().auth.user?.username
        ).toBe("test@example.com");
    });

    test("profile menu can be opened", () => {
        render(
            <Provider store={store}>
                <DashboardPage />
            </Provider>
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Open profile menu",
            })
        );

        expect(
            screen.getByText("test@example.com")
        ).toBeInTheDocument();
    });

    test("profile menu can be closed", () => {
        render(
            <Provider store={store}>
                <DashboardPage />
            </Provider>
        );

        const profileButton = screen.getByRole("button", {
            name: "Open profile menu",
        });

        fireEvent.click(profileButton);

        expect(
            screen.getByText("test@example.com")
        ).toBeInTheDocument();

        fireEvent.click(profileButton);

        expect(
            screen.queryByText("test@example.com")
        ).not.toBeInTheDocument();
    });
});