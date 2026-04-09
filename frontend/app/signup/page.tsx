import { redirect } from "next/navigation";

type SearchParams = {
  inviteToken?: string | string[];
};

export default function SignupPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const inviteToken = Array.isArray(searchParams.inviteToken)
    ? searchParams.inviteToken[0]
    : searchParams.inviteToken;

  const destination = inviteToken
    ? `/auth?mode=signup&inviteToken=${encodeURIComponent(inviteToken)}`
    : "/auth?mode=signup";

  redirect(destination);
}
