import { Link } from "react-router";

function Error() {
  return (
    <section className="flex grow items-center">
      <div className="container mx-auto text-center md:text-left">
        <h3 className="text-6xl font-bold mb-4">404</h3>
        <p className="mb-8 text-lg text-zinc-400">
          Oops! The page you're looking for doesn't exit
        </p>
        <Link
          className="px-4 py-2 md:p-3 hover:bg-zinc-500 rounded-lg bg-zinc-950"
          to={"/"}
        >
          Go Back Home
        </Link>
      </div>
    </section>
  );
}

export default Error;
