export interface Credentials {
  username: string;
  password: string;
}

// The shared password is printed on the login page itself; nothing in this file is a
// secret.
export const PASSWORD_FOR_ALL_USERS = 'secret_sauce';

export const STANDARD_USER: Credentials = {
  username: 'standard_user',
  password: PASSWORD_FOR_ALL_USERS,
};

export const LOCKED_OUT_USER: Credentials = {
  username: 'locked_out_user',
  password: PASSWORD_FOR_ALL_USERS,
};

export const PROBLEM_USER: Credentials = {
  username: 'problem_user',
  password: PASSWORD_FOR_ALL_USERS,
};

export const PERFORMANCE_GLITCH_USER: Credentials = {
  username: 'performance_glitch_user',
  password: PASSWORD_FOR_ALL_USERS,
};

export const ERROR_USER: Credentials = {
  username: 'error_user',
  password: PASSWORD_FOR_ALL_USERS,
};

export const VISUAL_USER: Credentials = {
  username: 'visual_user',
  password: PASSWORD_FOR_ALL_USERS,
};

export const WRONG_PASSWORD = 'definitely_not_the_password';
