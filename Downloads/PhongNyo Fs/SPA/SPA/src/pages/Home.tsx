import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="flex grow items-center  bg-zinc-900">
      <div className="text-center p-8 md:text-left container mx-auto">
        <h1 className="mb-4 text-3xl font-bold md:text-5xl ">
          Welcome to Our Fashion Shop
        </h1>
        <p className="mb-8 text-lg text-gray-500 md:text-xl">
          This is simple landing page built with React, Typescript, and
          TailwindCSS
        </p>
        <Link
          className=" m-3 border-2 bg-gray-700 border-gray-700 text-white px-6 py-3 rounded-md hover:bg-zinc-800 shadow-md"
          to="/shop"
        >
          Get Started
        </Link>
      </div>
    </section>
  );
}
