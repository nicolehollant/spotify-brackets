import { useRouter } from 'next/router'
import { useEffect } from 'react'

const Index = () => {
  const router = useRouter()
  useEffect(() => {
    router.push('/playlist/search')
  }, [])
  return (
    <div className="bg-slate-900 h-full w-full flex flex-col gap-8 text-white items-center justify-center text-lg">
      <div>redirecting...</div>
    </div>
  )
}

export default Index
