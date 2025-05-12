import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-md">
        {/* You can add a logo or app name here */}
        {children}
      </div>
    </div>
  );
}
