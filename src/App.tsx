import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import { useAuthenticator } from '@aws-amplify/ui-react';

const client = generateClient<Schema>();

export default function App() {
  const { signOut } = useAuthenticator();

  const [todos, setTodos] = useState<Schema['Todo']['type'][]>([]);
  const [transactions, setTransactions] = useState<
    Schema['Transaction']['type'][]
  >([]);
  const [balance, setBalance] = useState<number>(0);

  // === Fetch todos ===
  useEffect(() => {
    const sub = client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos(data.items),
    });
    return () => sub.unsubscribe();
  }, []);

  // === Fetch transactions & compute balance ===
  useEffect(() => {
    const sub = client.models.Transaction.observeQuery().subscribe({
      next: (data) => {
        setTransactions(data.items);
        const total = data.items.reduce((sum, t) => {
          return sum + (t.type === 'income' ? t.amount : -t.amount);
        }, 0);
        setBalance(total);
      },
    });
    return () => sub.unsubscribe();
  }, []);

  // === Actions ===
  const createTodo = async () => {
    const content = window.prompt('Todo content?');
    if (content) {
      await client.models.Todo.create({ content, isDone: false });
    }
  };

  const deleteTodo = async (id: string) => {
    await client.models.Todo.delete({ id });
  };

  const createTransaction = async () => {
    const type = window.prompt('Type (income/expense)?');
    const amount = parseFloat(window.prompt('Amount?') || '0');
    const description = window.prompt('Description?') || '';
    if (type && amount && !isNaN(amount)) {
      await client.models.Transaction.create({
        type,
        amount,
        description,
        createdAt: new Date().toISOString(),
      });
    }
  };

  const deleteTransaction = async (id: string) => {
    await client.models.Transaction.delete({ id });
  };

  return (
    <main style={{ padding: '2rem' }}>
      <h1>💰 Wallet Dashboard</h1>
      <p>
        <strong>Balance:</strong> ${balance.toFixed(2)}
      </p>
      <button onClick={createTransaction}>+ Add Transaction</button>
      <ul>
        {transactions.map((tx) => (
          <li key={tx.id} onClick={() => deleteTransaction(tx.id)}>
            [{tx.type}] ${tx.amount} - {tx.description}
          </li>
        ))}
      </ul>

      <hr />

      <h2>✅ Todos</h2>
      <button onClick={createTodo}>+ Add Todo</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} onClick={() => deleteTodo(todo.id)}>
            {todo.content} {todo.isDone ? '(done)' : ''}
          </li>
        ))}
      </ul>

      <button onClick={signOut} style={{ marginTop: '2rem' }}>
        Sign out
      </button>
    </main>
  );
}
