export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return typeof password === 'string' && password.length >= 8;
};

export const validateName = (name: string): boolean => {
  return typeof name === 'string' && name.trim().length >= 2;
};