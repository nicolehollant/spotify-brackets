import { NextPage } from 'next'
import Bracket from '../components/bracket'
import { relevantInfo } from '../hooks/bracket'

const Home: NextPage = () => {
  const songs = relevantInfo

  return (
    <>
      <Bracket songs={songs}></Bracket>
    </>
  )
}
export default Home
