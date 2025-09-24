import Link from "next/link";

function header() {
  return (
    <>
      <div className="flex justify-center gap-4 py-3 bg-gray-500">
        <Link href="/"  className="p-4 bg-white text-black font-bold text-xl rounded-xl ">Home</Link>
        <Link href="/authentication" className="p-4 bg-white text-black font-bold text-xl rounded-xl ">Login</Link>
      </div>
    </>
  );
}

export default header;
