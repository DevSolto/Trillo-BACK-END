import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { CreateAuthDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  async login({ email, password }: CreateAuthDto) {
    const user = await this.userRepo.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'name', 'role'],
    })
    const valid = user ? await bcrypt.compare(password, user.password) : false
    if (!user || !valid) {
      throw new UnauthorizedException('Credenciais inválidas')
    }

    const payload = {
      username:user.email,
      sub:user.id
    }
    return{accessToken: this.jwtService.sign(payload)}
  }
}
