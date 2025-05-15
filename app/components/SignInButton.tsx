
import { signIn, auth } from "@/app/auth"
 
export default async function SignIn() {
  const session = await auth()
  if (session) {
    return <p>Signed in as {session.user?.email}</p>
  }

  return (
    <form
      action={async () => {
        "use server"
        await signIn("spotify")
      }}
    >
      <button type="submit">Signin with Spotify</button>
    </form>
  )
}