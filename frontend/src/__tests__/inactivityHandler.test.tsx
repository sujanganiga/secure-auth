import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";

import { store } from "@/store/store";
import { login, logout } from "@/store/authSlice";

import InactivityHandler from "@/components/InactivityHandler";

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({
        replace: mockReplace,
        push: jest.fn(),
    }),
}));

describe("InactivityHandler", () => {
    beforeEach(() => {
        jest.useFakeTimers();

        mockReplace.mockClear();

        store.dispatch(
            login({
                token: "test-token",
                refreshToken: "test-refresh-token",
                username: "test@example.com",
            })
        );
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();

        store.dispatch(logout());
    });

    test("logs out and redirects after inactivity", async () => {
        render(
            <Provider store={store}>
                <InactivityHandler />
            </Provider>
        );

        jest.advanceTimersByTime(10 * 60 * 1000);

        await waitFor(() => {
            expect(store.getState().auth.isAuthenticated).toBe(false);
        });

        expect(mockReplace).toHaveBeenCalledWith("/login");
    });

    test("resets inactivity timer when user is active", async () => {
    render(
        <Provider store={store}>
            <InactivityHandler />
        </Provider>
    );

    // Advance 9 minutes
    jest.advanceTimersByTime(9 * 60 * 1000);

    // User activity
    fireEvent.mouseMove(window);

    // Advance another 9 minutes
    jest.advanceTimersByTime(9 * 60 * 1000);

    // User should still be logged in
    expect(
        store.getState().auth.isAuthenticated
    ).toBe(true);

    expect(mockReplace).not.toHaveBeenCalled();

    // Now advance the remaining 1 minute
    jest.advanceTimersByTime(60 * 1000);

    await waitFor(() => {
        expect(
            store.getState().auth.isAuthenticated
        ).toBe(false);
    });

    expect(mockReplace).toHaveBeenCalledWith("/login");
});
});