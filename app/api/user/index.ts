import { User } from "@/types/user";

const { FIRST_NAME, PHONE_NUMBER } = process.env;

if (!FIRST_NAME || !PHONE_NUMBER) {
  throw new Error("Error!  Set up a default user before using the application");
}

const user: User = {
  name: FIRST_NAME,
  phone: PHONE_NUMBER,
};

export function getUser() {
  return user;
}
