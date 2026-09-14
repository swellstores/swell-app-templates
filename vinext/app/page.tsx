import Catalog from './catalog';

export default function Home() {
  return <main>
    <h1>Swell Vinext app</h1>
    <p>Vinext with native app routes, hosted by Swell.</p>
    <Catalog />
    <p><a href="/app-api/hello">Public app endpoint</a></p>
  </main>;
}
