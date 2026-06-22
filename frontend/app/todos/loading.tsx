// 데이터 로딩 중 보여줄 화면 (서버 컴포넌트, "use client" 불필요)
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-xl p-6">
      <div className="mb-6 h-8 w-40 animate-pulse rounded bg-gray-200" />
      <ul className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </ul>
    </main>
  );
}
