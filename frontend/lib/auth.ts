const API_URL =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
    "/api-backend";


type LoginResponse = {
    access: string;
    refresh: string;
};


export async function login(
    username: string,
    password: string
): Promise<LoginResponse> {
    const response = await fetch(
        `${API_URL}/auth/token/`,
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json",
            },
            body: JSON.stringify({
                username,
                password,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail ||
            data.error ||
            "Login failed"
        );
    }

    return data;
}


export async function register(
    username: string,
    email: string,
    password: string
) {
    const response = await fetch(
        `${API_URL}/auth/register/`,
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json",
            },
            body: JSON.stringify({
                username,
                email,
                password,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail ||
            data.email?.[0] ||
            data.username?.[0] ||
            data.password?.[0] ||
            data.error ||
            "Registration failed"
        );
    }

    return data;
}