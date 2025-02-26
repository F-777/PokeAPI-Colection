import { useState } from 'react'
import './App.css'
import PokeApi from './Poke-API/api'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <PokeApi/>
    </>
  )
}

export default App
