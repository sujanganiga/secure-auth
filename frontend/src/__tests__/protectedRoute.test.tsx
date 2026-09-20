import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";

import { store } from "@/store/store";
import { logout, initializeAuth } from "@/store/authSlice";

import ProtectedRoute from "@/components/ProtectedRoute";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockPush,
        replace: jest.fn(),
    }),
}));

describe("ProtectedRoute", () => {
    beforeEach(() => {
        mockPush.mockClear();

        store.dispatch(logout());
        store.dispatch(initializeAuth());
    });

    test("redirects unauthenticated user to login", async () => {
        render(
            <Provider store={store}>
                <ProtectedRoute>
                    <div>Protected Content</div>
                </ProtectedRoute>
            </Provider>
        );

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith("/login");
        });

        expect(
            screen.queryByText("Protected Content")
        ).not.toBeInTheDocument();
    });
});