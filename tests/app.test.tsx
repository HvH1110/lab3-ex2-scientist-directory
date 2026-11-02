import { render, screen } from '@testing-library/react';
import { App } from '../src/App';

describe('App', () => {
  it('renders a page heading distinct from the directory heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Scientists & Pioneers');
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Pioneer Directory');
  });

  it('uses no <div> inside the app', () => {
    const { container } = render(<App />);
    expect(container.querySelectorAll('div div')).toHaveLength(0);
  });
});
