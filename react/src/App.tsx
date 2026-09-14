import Catalog from './Catalog';
import './App.css';

export default function App() {
  return <main>
    <h1>Swell React app</h1>
    <p>React + Vite with an app Worker, hosted by Swell.</p>
    <Catalog />
    <p><a href="/app-api/hello">Public Worker endpoint</a></p>
    <p><a href="/example/deep-link">SPA deep link</a></p>
  </main>;
}
