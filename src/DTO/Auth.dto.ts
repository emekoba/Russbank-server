export class SignUpDto {
  first_name: String;
  last_name: String;
  phone_number: String;
  email: String;
  password: String;
  confirm_password: String;
}

export class SignInDto {
  phone_number: String;
  password: String;
}
