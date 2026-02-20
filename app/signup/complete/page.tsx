// app/signup/complete/page.tsx
import SignupCompleteClient from "./SignupCompleteClient";

type Props = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function SignupCompletePage({ searchParams }: Props) {
  const nextParam = searchParams?.next;
  const next =
    typeof nextParam === "string" && nextParam.trim().length > 0
      ? nextParam
      : "/";

  return <SignupCompleteClient next={next} />;
}
