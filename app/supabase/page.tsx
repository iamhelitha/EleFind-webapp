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
        <h1 className="font-heading text-2xl font-bold text-ink">Supabase Todos</h1>
        <p className="mt-4 rounded-lg bg-clay-surface px-4 py-3 text-sm text-clay-text">
          Failed to load todos.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-heading text-2xl font-bold text-ink">Supabase Todos</h1>
      <ul className="mt-6 space-y-2">
        {todos?.map((todo) => (
          <li key={todo.id} className="rounded-lg border border-divider bg-sand-surface px-4 py-3">
            {todo.name}
          </li>
        ))}
        {todos?.length === 0 && <li className="text-sm text-muted">No todos found.</li>}
      </ul>
    </div>
  );
}
