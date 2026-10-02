export default function Card({
  title,
  file,
  children,
}: Readonly<{ title: string; file: string; children: React.ReactNode }>) {
  return (
    <li className="card">
      <h2>{title}</h2>
      <div className="card-body">{children}</div>
      <code className="file">{file}</code>
    </li>
  )
}
