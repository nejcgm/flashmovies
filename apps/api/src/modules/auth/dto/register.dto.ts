import { IsEmail, IsString, MinLength, MaxLength, Matches, IsOptional, Validate, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

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
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;
}
