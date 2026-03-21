import {
  ConflictException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmailOrUsername(dto.email, dto.username);
    if (existing) {
      throw new ConflictException("Email or username already in use.");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: dto.email,
      username: dto.username,
      city: dto.city,
      passwordHash
    });

    return this.createAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials.");
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException("Invalid credentials.");
    }

    return this.createAuthResponse(user);
  }

  async me(userId: string) {
    const user = await this.usersService.findByIdOrThrow(userId);
    return this.usersService.toAuthUser(user);
  }

  private createAuthResponse(user: Awaited<ReturnType<UsersService["findByIdOrThrow"]>>) {
    const payload = { sub: user.id, email: user.email, username: user.username };
    return {
      accessToken: this.jwtService.sign(payload),
      user: this.usersService.toAuthUser(user)
    };
  }
}
