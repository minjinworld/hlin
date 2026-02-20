// app/login/page.tsx
import LoginClient from "./LoginClient";

type Props = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function LoginPage({ searchParams }: Props) {
  const nextParam = searchParams?.next;
  const next =
    typeof nextParam === "string" && nextParam.trim().length > 0
      ? nextParam
      : "/";

  return <LoginClient next={next} />;
}
