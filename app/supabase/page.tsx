import { createClient } from "@/utils/supabase/server";

type TodoRow = {
  id: string;
  name: string;
};

export default async function SupabaseTodosPage() {
  const supabase = await createClient();
  const { data: todos, error } = await supabase
    .from("todos")
    .select("id, name")
    .returns<TodoRow[]>();

  if (error) {
    console.error("[supabase/page] Failed to load todos", error);

    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-heading text-2xl font-bold text-green-900">Supabase Todos</h1>
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load todos.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-heading text-2xl font-bold text-green-900">Supabase Todos</h1>
      <ul className="mt-6 space-y-2">
        {todos?.map((todo) => (
          <li key={todo.id} className="rounded-lg border border-card-border bg-card-bg px-4 py-3">
            {todo.name}
          </li>
        ))}
        {todos?.length === 0 && <li className="text-sm text-muted">No todos found.</li>}
      </ul>
    </div>
  );
}
