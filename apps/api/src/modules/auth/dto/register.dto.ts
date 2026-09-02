import { IsEmail, IsString, MinLength, MaxLength, IsOptional, Validate, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'noPlus', async: false })
class NoPlusInEmail implements ValidatorConstraintInterface {
  validate(email: string) {
    return !email.includes('+');
  }

  defaultMessage() {
    return 'Email address cannot contain "+"';
  }
}

export class RegisterDto {
  @IsEmail()
  @Validate(NoPlusInEmail)
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;
}
