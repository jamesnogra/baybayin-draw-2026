import SubApp from 'client/src/SubApp'
import { renderToString } from 'react-dom/server'

type AppProps = {
  name: string
}

export default function App({ name }: AppProps) {
  const customName = 'James'
  const html = renderToString(<SubApp name={customName} />)
  return (
    <div>
      <h1>Hello {name} 👋</h1>
      <p>This is a React component rendered by Bun + Hono.</p>
      <div><SubApp name={customName} /></div>
    </div>
  )
}