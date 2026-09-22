import React from "react";
import {
    render,
    screen,
    fireEvent,
    act,
    waitFor,
    cleanup,
} from "@testing-library/react";
import { Provider } from "react-redux";

import InactivityHandler from "@/components/InactivityHandler";
import { store } from "@/store/store";
import {
    login,
    logout,
    initializeAuth,
} from "@/store/authSlice";

import { logoutApi } from "@/services/authService";

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: mockReplace,
    }),
}));

jest.mock("@/services/authService", () => ({
    logoutApi: jest.fn(),
}));

const renderHandler = () => {
    return render(
        <Provider store={store}>
            <InactivityHandler />
        </Provider>
    );
};

describe("InactivityHandler", () => {
    beforeEach(() => {
        jest.useFakeTimers();

        jest.clearAllMocks();

        localStorage.clear();
        sessionStorage.clear();

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

        (logoutApi as jest.Mock).mockResolvedValue({
            message: "Logout successful",
        });
    });

    afterEach(() => {
        cleanup();

        act(() => {
            store.dispatch(logout());
        });

        jest.clearAllTimers();
        jest.useRealTimers();

        localStorage.clear();
        sessionStorage.clear();

        mockReplace.mockClear();
    });

    test("renders without timeout warning initially", () => {
        renderHandler();

        expect(
            screen.queryByText("Session Timeout")
        ).not.toBeInTheDocument();
    });

    test("does not show timeout warning before 5 seconds", () => {
        renderHandler();

        act(() => {
            jest.advanceTimersByTime(4000);
        });

        expect(
            screen.queryByText("Session Timeout")
        ).not.toBeInTheDocument();
    });

    test("shows timeout warning after 5 seconds", () => {
        renderHandler();

        act(() => {
            jest.advanceTimersByTime(5000);
        });

        expect(
            screen.getByText("Session Timeout")
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                /Your session will expire in/
            )
        ).toBeInTheDocument();
    });

    test("warning initially shows 5 seconds", () => {
        renderHandler();

        act(() => {
            jest.advanceTimersByTime(5000);
        });

        expect(
            screen.getByText("5", { exact: true })
        ).toBeInTheDocument();
    });

    test("mouse activity resets inactivity timer", () => {
        renderHandler();

        act(() => {
            jest.advanceTimersByTime(4000);
        });

        fireEvent.mouseMove(window);

        act(() => {
            jest.advanceTimersByTime(4000);
        });

        expect(
            screen.queryByText("Session Timeout")
        ).not.toBeInTheDocument();

        expect(
            store.getState().auth.isAuthenticated
        ).toBe(true);
    });

    test("keyboard activity resets inactivity timer", () => {
        renderHandler();

        act(() => {
            jest.advanceTimersByTime(4000);
        });

        fireEvent.keyDown(window, {
            key: "a",
        });

        act(() => {
            jest.advanceTimersByTime(4000);
        });

        expect(
            store.getState().auth.isAuthenticated
        ).toBe(true);
    });

    test("click activity resets inactivity timer", () => {
        renderHandler();

        act(() => {
            jest.advanceTimersByTime(4000);
        });

        fireEvent.click(window);

        act(() => {
            jest.advanceTimersByTime(4000);
        });

        expect(
            store.getState().auth.isAuthenticated
        ).toBe(true);
    });

    test("scroll activity resets inactivity timer", () => {
        renderHandler();

        act(() => {
            jest.advanceTimersByTime(4000);
        });

        fireEvent.scroll(window);

        act(() => {
            jest.advanceTimersByTime(4000);
        });

        expect(
            store.getState().auth.isAuthenticated
        ).toBe(true);
    });

    test("touch activity resets inactivity timer", () => {
        renderHandler();

        act(() => {
            jest.advanceTimersByTime(4000);
        });

        fireEvent.touchStart(window);

        act(() => {
            jest.advanceTimersByTime(4000);
        });

        expect(
            store.getState().auth.isAuthenticated
        ).toBe(true);
    });

    test("activity during warning closes warning", () => {
        renderHandler();

        act(() => {
            jest.advanceTimersByTime(5000);
        });

        expect(
            screen.getByText("Session Timeout")
        ).toBeInTheDocument();

        fireEvent.mouseMove(window);

        expect(
            screen.queryByText("Session Timeout")
        ).not.toBeInTheDocument();
    });

    test("activity during warning prevents logout", () => {
        renderHandler();

        act(() => {
            jest.advanceTimersByTime(5000);
        });

        fireEvent.mouseMove(window);

        act(() => {
            jest.advanceTimersByTime(5000);
        });

        expect(
            store.getState().auth.isAuthenticated
        ).toBe(true);

        expect(mockReplace).not.toHaveBeenCalled();
        expect(logoutApi).not.toHaveBeenCalled();
    });

    test("calls backend logout after inactivity", async () => {
        renderHandler();

        act(() => {
            jest.advanceTimersByTime(10000);
        });

        await waitFor(() => {
            expect(logoutApi).toHaveBeenCalledWith(
                "test-token",
                "test-refresh-token"
            );
        });
    });

    test("logs out from Redux after inactivity", async () => {
        renderHandler();

        act(() => {
            jest.advanceTimersByTime(10000);
        });

        await waitFor(() => {
            expect(
                store.getState().auth.isAuthenticated
            ).toBe(false);
        });
    });

    test("redirects to login after inactivity", async () => {
        renderHandler();

        act(() => {
            jest.advanceTimersByTime(10000);
        });

        await waitFor(() => {
            expect(mockReplace).toHaveBeenCalledWith(
                "/login"
            );
        });
    });

    test("stores session expired message", async () => {
        renderHandler();

        act(() => {
            jest.advanceTimersByTime(10000);
        });

        await waitFor(() => {
            expect(
                sessionStorage.getItem(
                    "sessionExpiredMessage"
                )
            ).toBe(
                "Session expired due to inactivity."
            );
        });
    });

    test("removes token after logout", async () => {
        renderHandler();

        act(() => {
            jest.advanceTimersByTime(10000);
        });

        await waitFor(() => {
            expect(
                localStorage.getItem("token")
            ).toBeNull();
        });
    });

    test("removes refresh token after logout", async () => {
        renderHandler();

        act(() => {
            jest.advanceTimersByTime(10000);
        });

        await waitFor(() => {
            expect(
                localStorage.getItem("refreshToken")
            ).toBeNull();
        });
    });

    test("removes username after logout", async () => {
        renderHandler();

        act(() => {
            jest.advanceTimersByTime(10000);
        });

        await waitFor(() => {
            expect(
                localStorage.getItem("username")
            ).toBeNull();
        });
    });

    test("frontend logout still happens when backend logout fails", async () => {
        (logoutApi as jest.Mock).mockRejectedValueOnce(
            new Error("Backend logout failed")
        );

        renderHandler();

        act(() => {
            jest.advanceTimersByTime(10000);
        });

        await waitFor(() => {
            expect(
                store.getState().auth.isAuthenticated
            ).toBe(false);
        });

        expect(mockReplace).toHaveBeenCalledWith(
            "/login"
        );
    });

    test("does nothing when user is unauthenticated", () => {
        act(() => {
            store.dispatch(logout());
        });

        renderHandler();

        act(() => {
            jest.advanceTimersByTime(10000);
        });

        expect(
            screen.queryByText("Session Timeout")
        ).not.toBeInTheDocument();

        expect(logoutApi).not.toHaveBeenCalled();

        expect(mockReplace).not.toHaveBeenCalled();
    });
});