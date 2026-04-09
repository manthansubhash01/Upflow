import { redirect } from "next/navigation";

type SearchParams = {
  inviteToken?: string | string[];
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const inviteToken = Array.isArray(searchParams.inviteToken)
    ? searchParams.inviteToken[0]
    : searchParams.inviteToken;

  const destination = inviteToken
    ? `/auth?mode=login&inviteToken=${encodeURIComponent(inviteToken)}`
    : "/auth?mode=login";

  redirect(destination);
}
