import Link from "next/link";

function header() {
  return (
    <div className="bg-white">
      <div className="wrapper py-3 flex justify-between items-center">
        <h1>
          <Link href="/" className="flex gap-1 items-center">
            <img src="logo.png" alt="Logo" className="w-8" />
            <h2 className="text-lg font-extrabold text-black">LifeCraft</h2>
          </Link>
        </h1>
        <nav className="gap-5 flex items-center text-black text-sm">
          <Link href="/" className="p-2.5 rounded-md hover:bg-gray-100">Features</Link>
          <Link href="/" className="p-2.5 rounded-md hover:bg-gray-100">Pricing</Link>
          <Link href="/" className="p-2.5 rounded-md hover:bg-gray-100">Advisors</Link>
          <Link href="/" className="p-2.5 rounded-md hover:bg-gray-100">Resources</Link>
          <Link href="/" className="p-2.5 rounded-md hover:bg-gray-100">About Us</Link>
        </nav>
          <Link href="/authentication" className="p-2.5 bg-white shadow-xl text-sm rounded-md text-black font-bold hover:bg-gray-100">Try for free</Link>
      </div>
    </div>
  );
}

export default header;
