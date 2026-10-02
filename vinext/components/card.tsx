export default function Card({
  title,
  file,
  children,
}: Readonly<{ title: string; file: string; children: React.ReactNode }>) {
  return (
    <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-2 flex-1 text-sm leading-6 text-slate-600">{children}</div>
      <code className="mt-4 block whitespace-nowrap rounded bg-slate-100 px-3 py-2 text-xs">{file}</code>
    </div>
  );
}
