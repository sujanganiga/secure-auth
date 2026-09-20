import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";

import { store } from "@/store/store";
import { login, initializeAuth } from "@/store/authSlice";
import Navbar from "@/components/Navbar";

import { logoutApi } from "@/services/authService";

const mockReplace = jest.fn();
const mockMenuClick = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: mockReplace,
    }),
}));

jest.mock("@/services/authService", () => ({
    logoutApi: jest.fn(),
}));

describe("Navbar Logout", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        store.dispatch(
            login({
                token: "test-token",
                refreshToken: "refresh-token",
                username: "test@example.com",
            })
        );

        store.dispatch(initializeAuth());
    });

    test("logs out user and redirects to login", async () => {
        (logoutApi as jest.Mock).mockResolvedValue({
            message: "Logout successful",
        });

        render(
            <Provider store={store}>
                <Navbar onMenuClick={mockMenuClick} />
            </Provider>
        );

        // Open profile dropdown
        fireEvent.click(
            screen.getByRole("button", {
                name: /test@example.com/i,
            })
        );

        // Click logout
        fireEvent.click(
            screen.getByRole("button", {
                name: "Logout",
            })
        );

        await waitFor(() => {
            expect(logoutApi).toHaveBeenCalled();
        });

        expect(mockReplace).toHaveBeenCalledWith("/login");
    });
});