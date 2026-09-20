import MockAdapter from "axios-mock-adapter";

import api from "@/lib/axios";
import { store } from "@/store/store";
import { login, logout } from "@/store/authSlice";

const mock = new MockAdapter(api);

describe("Axios Authentication", () => {
    beforeEach(() => {
        store.dispatch(logout());
        mock.reset();
    });

    test("logs out when 401 occurs and no refresh token exists", async () => {
        store.dispatch(
            login({
                token: "expired-token",
                refreshToken: "refresh-token",
                username: "test@example.com",
            })
        );

        mock.onGet("/protected").reply(401);

        try {
            await api.get("/protected");
        } catch (error) {
            // Expected 401 error
        }

        const state = store.getState();

        expect(state.auth.isAuthenticated).toBe(false);
        expect(state.auth.token).toBeNull();


    });

    test("refreshes token and retries request when 401 occurs", async () => {
    store.dispatch(
        login({
            token: "expired-token",
            refreshToken: "old-refresh-token",
            username: "test@example.com",
        })
    );

    mock.onGet("/protected")
        .replyOnce(401)
        .onGet("/protected")
        .reply(200, {
            message: "Success",
        });

    mock.onPost("/refresh").reply(200, {
        token: "new-access-token",
        refreshToken: "new-refresh-token",
        username: "test@example.com",
    });

    const response = await api.get("/protected");

    expect(response.status).toBe(200);

    const state = store.getState();

    expect(state.auth.token).toBe("new-access-token");

    expect(state.auth.refreshToken).toBe(
        "new-refresh-token"
    );

    expect(state.auth.user?.username).toBe(
        "test@example.com"
    );
});

test("logs out when token refresh fails", async () => {
    store.dispatch(
        login({
            token: "expired-token",
            refreshToken: "invalid-refresh-token",
            username: "test@example.com",
        })
    );

    mock.onGet("/protected").reply(401);

    mock.onPost("/refresh").reply(401, {
        message: "Refresh token expired",
    });

    try {
        await api.get("/protected");
    } catch (error) {
        // Expected refresh failure
    }

    const state = store.getState();

    expect(state.auth.isAuthenticated).toBe(false);
    expect(state.auth.token).toBeNull();
});
});