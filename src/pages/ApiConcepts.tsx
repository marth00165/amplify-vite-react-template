import { useState } from 'react';

const ApiConcepts = () => {
  const [baseUrl, setBaseUrl] = useState(
    'https://jsonplaceholder.typicode.com'
  );
  const [path, setPath] = useState('/posts');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const res = await fetch(baseUrl + path);
      const data = await res.json();
      setResponse(data);
      console.log(data);
    } catch (error) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', error);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 16 }}>
      <input
        placeholder='Base URL'
        value={baseUrl}
        onChange={(e) => setBaseUrl(e.target.value)}
        style={{ width: 420, marginRight: 8 }}
      />
      <input
        placeholder='/path'
        value={path}
        onChange={(e) => setPath(e.target.value)}
        style={{ width: 220, marginRight: 8 }}
      />
      <button onClick={handleSend}>Send</button>

      {response && (
        <pre
          style={{
            marginTop: 16,
            padding: 16,
            background: '#f0f0f0',
            borderRadius: 8,
            maxHeight: '60vh',
            overflow: 'auto',
          }}
        >
          {JSON.stringify(response, null, 2)}
        </pre>
      )}

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
    </div>
  );
};

export default ApiConcepts;
