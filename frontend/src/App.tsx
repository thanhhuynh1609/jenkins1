import React, { useEffect, useState } from "react";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

export default function App() {
  const [health, setHealth] = useState("checking...");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");

  async function refresh() {
    const h = await fetch("/api/health").then(r => r.json()).catch(() => ({status:"fail"}));
    setHealth(h.status ?? "fail");
    const t = await fetch("/api/todos").then(r => r.json()).catch(() => ({todos: []}));
    setTodos(t.todos || []);
  }

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await fetch("/api/todos", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ title })
    });
    setTitle("");
    refresh();
  }

  async function toggle(id: number) {
    await fetch(`/api/todos/${id}/toggle`, { method: "PATCH" });
    refresh();
  }

  async function remove(id: number) {
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
    refresh();
  }

  useEffect(() => { refresh(); }, []);

  return (
    <div style={{maxWidth: 720, margin: "40px auto", fontFamily: "system-ui, sans-serif"}}>
      <h1>📝 FastAPI + React TodoListt</h1>
      <p>Backend health: <b>{health}</b></p>

      <form onSubmit={addTodo} style={{display: "flex", gap: 8, marginBottom: 20}}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="New todo..."
          style={{flex: 1, padding: 8}}
        />
        <button type="submit">Add</button>
      </form>

      <ul style={{listStyle: "none", padding: 0}}>
        {todos.map(todo => (
          <li key={todo.id} style={{
            display: "flex", justifyContent: "space-between", padding: "8px 0",
            borderBottom: "1px solid #ccc", alignItems: "center"
          }}>
            <span
              onClick={() => toggle(todo.id)}
              style={{
                cursor: "pointer",
                textDecoration: todo.completed ? "line-through" : "none",
                color: todo.completed ? "#777" : "#000"
              }}
            >
              {todo.title}
            </span>
            <button onClick={() => remove(todo.id)} style={{color:"red"}}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
