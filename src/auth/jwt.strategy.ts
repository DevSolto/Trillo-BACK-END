import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(config: ConfigService) {
        super({
            // Prefer Supabase secret if provided; fallback to local JWT_SECRET
            secretOrKey: config.get<string>('SUPABASE_JWT_SECRET') ?? config.getOrThrow('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            algorithms: ['HS256'],
        })
    }

    async validate(payload: any) {
        // Supabase includes standard JWT claims like sub and email
        const email = payload?.email ?? payload?.username
        return {
            userId: payload.sub,
            userEmail: email,
        }
    }
}
