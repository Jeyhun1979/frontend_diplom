export const validateEmail = (email) => {
  const re = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^\+?[0-9]{10,15}$/;
  return re.test(phone.replace(/\D/g, ""));
};

export const validatePassport = (passport) => {
  const re = /^[0-9]{4}\s?[0-9]{6}$/;
  return re.test(passport);
};

export const validateRequired = (value) => {
  return value && value.trim() !== "";
};

export const validateMinLength = (value, min) => {
  return value && value.length >= min;
};

export const validateMaxLength = (value, max) => {
  return value && value.length <= max;
};

export const validateDate = (date) => {
  return !isNaN(new Date(date).getTime());
};

export const validateAge = (birthDate, minAge = 0) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= minAge;
};
