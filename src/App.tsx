import { ScientistDirectory } from './components/ScientistDirectory';

export function App() {
  return (
    <>
      <header>
        <h1>Scientists &amp; Pioneers</h1>
        <p>Search, filter and sort history's scientists and pioneers. Derived state, zero effects.</p>
      </header>
      <ScientistDirectory />
    </>
  );
}
