import { ScientistDirectory } from './components/ScientistDirectory';

export function App() {
  return (
    <>
      <header>
        <h1>Pioneer Directory</h1>
        <p>Search, filter and sort history's scientists and pioneers. Derived state, zero effects.</p>
      </header>
      <ScientistDirectory />
    </>
  );
}
