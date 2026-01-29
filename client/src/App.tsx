type AppProps = {
  name: string;
};

export default function App({ name }: AppProps) {
  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <h1>Hello {name} 👋</h1>
      <p>This is a React component rendered by Bun + Hono.</p>
    </div>
  );
}