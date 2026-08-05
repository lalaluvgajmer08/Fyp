import { Link } from 'react-router-dom';
import Container from '../components/common/Container';
import Button from '../components/common/Button';
import Eyebrow from '../components/common/Eyebrow';

export default function NotFound() {
  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center py-32 text-center">
      <Eyebrow className="mb-5">Error 404</Eyebrow>

      <p className="font-display text-[5rem] font-light leading-none text-gold-400 sm:text-[7rem]">
        404
      </p>

      <h1 className="mt-4 font-display text-[2rem] font-light text-cream-50 sm:text-[2.5rem]">
        This page could not be found
      </h1>

      <p className="mt-4 max-w-md text-muted-400">
        The page you are looking for may have been moved, or the link you followed may be out of
        date.
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button to="/" variant="primary" size="lg">
          Return home
        </Button>
        <Button to="/news" variant="secondary" size="lg">
          Browse updates
        </Button>
      </div>

      <p className="mt-8 text-sm text-muted-400">
        Looking for the admin area?{' '}
        <Link to="/login" className="text-gold-400 hover:text-gold-300">
          Sign in
        </Link>
      </p>
    </Container>
  );
}
