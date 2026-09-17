import api from "@/lib/axios";

export const login = async (
    username: string,
    password: string
) => {
    const response = await api.post("/login", {
        username,
        password,
    });

    console.log("Login response:", response.data);

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