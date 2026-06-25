import { redirect } from "next/navigation";

// 루트는 Todo 앱으로 보낸다
export default function Home() {
  redirect("/todos");
}
