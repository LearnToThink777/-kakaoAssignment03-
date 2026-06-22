"use client";

// 에러 경계 컴포넌트는 클라이언트 컴포넌트여야 한다 (Next.js 요구사항)
// Next 16.2부터 reset 대신 unstable_retry가 권장된다 (재요청 + 재렌더)
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <main className="mx-auto w-full max-w-xl p-6 text-center">
      <h2 className="mb-2 text-lg font-semibold text-red-600">
        문제가 발생했습니다
      </h2>
      <p className="mb-4 text-sm text-gray-500">{error.message}</p>
      <button
        onClick={() => unstable_retry()}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
      >
        다시 시도
      </button>
    </main>
  );
}
