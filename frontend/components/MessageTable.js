export default function MessageTable({ messages }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toxicity Level</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toxic?</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categories</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {messages.map(msg => (
            <tr key={msg.id} className={msg.is_toxic ? 'bg-red-50' : ''}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(msg.timestamp).toLocaleString()}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 break-all">{msg.text.slice(0, 100)}...</td>
              <td className="px-6 py-4 text-sm text-gray-900">{msg.language}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{msg.owner || '-'}</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {msg.toxicity_level ? (msg.toxicity_level * 100).toFixed(1) + '%' : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {msg.is_toxic ? (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Yes</span>
                ) : (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">No</span>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {msg.toxic_categories?.join(', ') || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}