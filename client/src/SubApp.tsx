type AppProps = {
  name: string
}

export default function SubApp({ name }: AppProps) {
  return (
    <div>
      <h1>Hello { name } from the Sub app</h1>
    </div>
  )
}