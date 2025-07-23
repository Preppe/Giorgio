import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { VoiceEngine } from '../users/dto/update-user-settings.dto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponse, JwtPayload, LogoutResponse } from './types/jwt.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.validateUser(loginDto.email, loginDto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const tokens = await this.generateTokens(user.id, user.email);
    return tokens;
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const user = await this.usersService.createUser(registerDto);
    const tokens = await this.generateTokens(user.id, user.email);
    return tokens;
  }

  async refresh(user: JwtPayload): Promise<AuthResponse> {
    const tokens = await this.generateTokens(user.sub, user.email);
    return tokens;
  }

  async logout(): Promise<LogoutResponse> {
    // Optionally invalidate refresh token in DB
    return { message: 'Logged out' };
  }

  async getCurrentUser(user: JwtPayload) {
    const userId = user.sub;
    const foundUser = await this.usersService.findUserById(userId);
    if (!foundUser) {
      throw new UnauthorizedException('User not found');
    }
    return foundUser;
  }

  async generateTokens(userId: string, email: string): Promise<AuthResponse> {
    const payload = { sub: userId, email };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET || 'secret',
      expiresIn: process.env.JWT_EXPIRES_IN || '5m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    return { accessToken, refreshToken };
  }
}
