export type User = {
    id: string;
    name: string;
    email: string;
    currency?: string;
};

export type LoginResponse = {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: User;
};

export type RegisterInput = {
    name: string;
    email: string;
    password: string;
    currency: string;
};