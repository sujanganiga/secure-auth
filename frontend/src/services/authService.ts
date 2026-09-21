import api from "@/lib/axios";

export const login = async (
    username: string,
    password: string
) => {
    const response = await api.post("/login", {
        username,
        password,
    });

   // console.log("Login response:", response.data);

    return response.data;
};

export const checkAuth = async (token: string) => {
    const response = await api.get("/auth", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};

export async function register(
    username: string,
    password: string
) {
    const response = await api.post("/register", {
        username,
        password,
    });

    return response.data;
};

// Backend logout
export async function logoutApi(
    token: string,
    refreshToken: string
) {
    const response = await api.post(
        "/logout",
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Refresh-Token": refreshToken,
            },
        }
    );

    return response.data;
}

export async function refreshToken(refreshToken: string) {
    const response = await api.post("/refresh", {
        refreshToken,
    });

    return response.data;
}