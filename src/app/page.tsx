import ClientRedirect from "@/components/redirect/ClientRedirect";

const SOFTWARE_PATH = "/software/";

export default function RootPage() {
  return (
    <>
      {/* Fallback for browsers without JavaScript: kicks in after 0 seconds. */}
      <meta httpEquiv="refresh" content={`0; url=${SOFTWARE_PATH}`} />
      {/* Immediate redirect for browsers with JavaScript, no history entry left behind. */}
      <ClientRedirect to={SOFTWARE_PATH} />
      <main className="flex min-h-screen items-center justify-center p-8 text-center">
        <p>
          Redirecting to{" "}
          <a href={SOFTWARE_PATH} className="underline">
            {SOFTWARE_PATH}
          </a>
          … If nothing happens,{" "}
          <a href={SOFTWARE_PATH} className="underline">
            click here
          </a>
          .
        </p>
      </main>
    </>
  );
}
