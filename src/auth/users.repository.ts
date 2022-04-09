import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EntityRepository, Repository, QueryFailedError } from 'typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
  async createUser(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    try {
      const { email, password } = authCredentialsDto;

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await this.create({
        password: hashedPassword,
        email,
      });

      await this.save(user);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('username or email already exist');
      }
      throw new InternalServerErrorException();
    }
  }
}
