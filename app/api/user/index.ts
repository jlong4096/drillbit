import { User, UserSchema } from "@/types/user";

const FIRST_NAME = process.env.FIRST_NAME || "";
const PHONE_NUMBER = process.env.PHONE_NUMBER || "";

const user: User = {
  name: FIRST_NAME,
  phone: PHONE_NUMBER,
};

export function getUser() {
  if (!FIRST_NAME || !PHONE_NUMBER) {
    throw new Error(
      "Error!  Set up a default user before using the application",
    );
  }

  return user;
}

export function updateUser(input: User) {
  const updatedUser = UserSchema.parse(input);

  if (!updatedUser) {
    throw new Error("User input not parsed correctly");
  }

  user.name = updatedUser.name;
  user.phone = updatedUser.phone;
}
