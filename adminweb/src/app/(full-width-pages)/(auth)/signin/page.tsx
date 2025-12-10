import SignInFormV2 from "@/components/auth/SignInFormV2";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập | Quản trị cơ khí",
  description: "Đăng nhập vào hệ thống quản trị cơ khí",
};

export default function SignIn() {
  return <SignInFormV2 />;
}

