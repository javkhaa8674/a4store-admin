// pages/AdminDashboard.jsx
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const options = [
    {
      title: "Дэлгүүр",
      desc: "Store",
      path: "/admin/store",
      icon: "🏪",
    },
    {
      title: "Гишүүд",
      desc: "A4",
      path: "/admin/a4",
      icon: "📄",
    },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin хэсэг</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((opt) => (
          <button
            key={opt.path}
            onClick={() => navigate(opt.path)}
            className="border rounded-xl p-6 text-left hover:shadow-lg transition"
          >
            <div className="text-3xl mb-2">{opt.icon}</div>
            <h2 className="font-semibold text-lg">{opt.title}</h2>
            <p className="text-sm text-gray-500">{opt.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
