import { GetServerSideProps, NextPage } from 'next'
import { BuiltInProviderType } from 'next-auth/providers'
import { signIn, getCsrfToken, getProviders, LiteralUnion, ClientSafeProvider } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FC, useState } from 'react'
import LoginButton from '../../components/login-button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { faGithub, faTwitter, faSpotify } from '@fortawesome/free-brands-svg-icons'

const Icons: Record<string, JSX.Element> = {
  Email: <FontAwesomeIcon icon={faPaperPlane} size="lg" />,
  GitHub: <FontAwesomeIcon icon={faGithub} size="lg" />,
  Twitter: <FontAwesomeIcon icon={faTwitter} size="lg" />,
  Spotify: <FontAwesomeIcon icon={faSpotify} size="lg" />,
  'Twitter (Legacy)': <FontAwesomeIcon icon={faTwitter} size="lg" style={{ maxWidth: '3rem' }} />,
}

interface SignInProps {
  csrfToken?: string
  providers: Record<LiteralUnion<BuiltInProviderType, string>, ClientSafeProvider> | null
}

const SigninForm: FC<SignInProps> = ({ csrfToken, providers }) => {
  const [email, setEmail] = useState('')
  const {
    query: { callbackUrl },
  } = useRouter()
  return (
    <div className="mx-auto flex h-max max-w-md flex-col gap-8 rounded-xl bg-slate-800 py-6 px-8 shadow text-white">
      <h1 className="text-2xl font-semibold">Sign In</h1>
      <div className="grid gap-8">
        <div className="space-y-3">
          {providers &&
            Object.values(providers)
              .filter((provider) => provider.name !== 'Email')
              .map((provider) => (
                <div key={provider.name}>
                  <button
                    onClick={() =>
                      signIn(provider.id, {
                        callbackUrl: Array.isArray(callbackUrl) ? callbackUrl[0] : callbackUrl ?? '/',
                      })
                    }
                    className="flex w-full items-center justify-between rounded-lg bg-blue-900 px-4 py-2 text-center text-lg font-semibold text-emerald-50 disabled:cursor-not-allowed disabled:bg-opacity-30 disabled:text-opacity-75"
                  >
                    <span>Sign in with {provider.name} </span>
                    {provider.name in Icons && Icons[provider.name]}
                  </button>
                </div>
              ))}
        </div>
      </div>
    </div>
  )
}

const SigninPage: NextPage<SignInProps> = ({ csrfToken, providers }) => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-900">
      <header className="sticky top-0 flex items-center justify-between gap-4 border-b border-b-slate-700 bg-blue-900 px-4 py-2 shadow backdrop-blur backdrop-filter">
        <h1 className="text-center text-3xl font-extrabold">
          <Link href="/">{'Bracket App {}'}</Link>
        </h1>
        <LoginButton showSignInButton={false}></LoginButton>
      </header>
      <div className="my-auto pb-[16vh] pt-8">
        <SigninForm providers={providers} csrfToken={csrfToken} />
      </div>
    </div>
  )
}

export default SigninPage

export const getServerSideProps: GetServerSideProps = async (context: any) => {
  const providers = await getProviders()
  const csrfToken = await getCsrfToken(context)
  return {
    props: {
      providers,
      csrfToken,
    },
  }
}
