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
    login,
    initializeAuth,
} from "@/store/authSlice";

import Navbar from "@/components/Navbar";

import { logoutApi } from "@/services/authService";

const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockMenuClick = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockPush,
        replace: mockReplace,
    }),
}));

jest.mock("@/services/authService", () => ({
    logoutApi: jest.fn(),
}));

const renderNavbar = () => {
    return render(
        <Provider store={store}>
            <Navbar
                onMenuClick={mockMenuClick}
                isMenuOpen={false}
            />
        </Provider>
    );
};

describe("Navbar", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        store.dispatch(
            login({
                token: "test-token",
                refreshToken: "refresh-token",
                username: "test@example.com",
            })
        );

        store.dispatch(
            initializeAuth()
        );
    });

    test("renders username without email domain", () => {
        renderNavbar();

        expect(
            screen.getByText("test")
        ).toBeInTheDocument();

        expect(
            screen.queryByText("test@example.com")
        ).not.toBeInTheDocument();
    });

    test("opens profile dropdown when profile button is clicked", () => {
        renderNavbar();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Open profile menu",
            })
        );

        expect(
            screen.getByText("Profile")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Settings")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Logout")
        ).toBeInTheDocument();
    });

    test("shows full email inside profile dropdown", () => {
        renderNavbar();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Open profile menu",
            })
        );

        expect(
            screen.getByText("test@example.com")
        ).toBeInTheDocument();
    });

    test("profile button can open and close dropdown", () => {
        renderNavbar();

        const profileButton =
            screen.getByRole("button", {
                name: "Open profile menu",
            });

        fireEvent.click(profileButton);

        expect(
            screen.getByText("Profile")
        ).toBeInTheDocument();

        fireEvent.click(profileButton);

        expect(
            screen.queryByText("Profile")
        ).not.toBeInTheDocument();
    });

    test("profile option does not redirect", () => {
        renderNavbar();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Open profile menu",
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Profile",
            })
        );

        expect(mockPush).not.toHaveBeenCalled();
        expect(mockReplace).not.toHaveBeenCalled();
    });

    test("settings option does not redirect", () => {
        renderNavbar();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Open profile menu",
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Settings",
            })
        );

        expect(mockPush).not.toHaveBeenCalled();
        expect(mockReplace).not.toHaveBeenCalled();
    });

    test("calls onMenuClick when menu button is clicked", () => {
        renderNavbar();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Open menu",
            })
        );

        expect(
            mockMenuClick
        ).toHaveBeenCalledTimes(1);
    });

    test("logs out user and redirects to login", async () => {
        (
            logoutApi as jest.Mock
        ).mockResolvedValue({
            message: "Logout successful",
        });

        renderNavbar();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Open profile menu",
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Logout",
            })
        );

        await waitFor(() => {
            expect(
                logoutApi
            ).toHaveBeenCalledWith(
                "test-token",
                "refresh-token"
            );
        });

        expect(
            mockReplace
        ).toHaveBeenCalledWith(
            "/login"
        );

        expect(
            store.getState().auth.isAuthenticated
        ).toBe(false);
    });

    test("still logs out and redirects when backend logout returns 401", async () => {
        (
            logoutApi as jest.Mock
        ).mockRejectedValue({
            response: {
                status: 401,
            },
        });

        renderNavbar();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Open profile menu",
            })
        );

        fireEvent.click(
            screen.getByRole("button", {
                name: "Logout",
            })
        );

        await waitFor(() => {
            expect(
                mockReplace
            ).toHaveBeenCalledWith(
                "/login"
            );
        });

        expect(
            store.getState().auth.isAuthenticated
        ).toBe(false);
    });
});