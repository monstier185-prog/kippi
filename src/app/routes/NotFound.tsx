import { Link } from 'react-router-dom';

/** Fallback route for unknown paths. */
export default function NotFound() {
  return (
    <section aria-labelledby="notfound-heading">
      <h1 id="notfound-heading">Page not found</h1>
      <p>The page you were looking for does not exist.</p>
      <p>
        <Link to="/">Return to the home page</Link>
      </p>
    </section>
  );
}
