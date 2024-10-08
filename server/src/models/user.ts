import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { UserType } from "../shared/types";
import { PASSWORD_SALT_LENGTH } from "../common/constants";

const userSchema = new mongoose.Schema<UserType>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, PASSWORD_SALT_LENGTH);
  }
  next();
});

const User = mongoose.model<UserType>("User", userSchema);

export default User;
