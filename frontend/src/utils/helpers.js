export const classNames = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
};

export const getInitials = (firstName, lastName) => {
  return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`;
};
