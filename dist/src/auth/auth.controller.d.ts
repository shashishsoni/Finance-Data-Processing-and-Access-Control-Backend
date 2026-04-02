import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
    me(user: {
        id: string;
        email: string;
        name: string;
        role: string;
    }): {
        id: string;
        email: string;
        name: string;
        role: string;
    };
}
