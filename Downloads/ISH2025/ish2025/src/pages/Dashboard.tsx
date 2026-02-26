import { useState } from "react";
import { Upload, LogIn, Settings, FileText, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const [active, setActive] = useState("upload");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedDocId, setSelectedDocId] = useState(null);

  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: "Resume.pdf",
      priority: "high",
      preview: "This is your CV with work history.",
    },
    {
      id: 2,
      name: "Invoice_Jan.xlsx",
      priority: "medium",
      preview: "Invoice for January expenses.",
    },
    {
      id: 3,
      name: "Project_Report.docx",
      priority: "low",
      preview: "Detailed project report document.",
    },
    {
      id: 4,
      name: "Photo_ID.png",
      priority: "medium",
      preview: "Your government-issued photo ID.",
    },
  ]);

  const priorityColors = {
    high: "bg-red-500/20 text-red-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    low: "bg-green-500/20 text-green-400",
  };

  // Upload new document
  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocuments((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: file.name,
        priority: "low",
        preview: "Newly uploaded file.",
      },
    ]);
  };

  // Change priority
  const handlePriorityChange = (id, newPriority) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, priority: newPriority } : d))
    );
  };

  // Search + filter
  const filteredDocs = documents.filter((doc) => {
    const matchName = doc.name.toLowerCase().includes(search.toLowerCase());
    const matchPriority =
      priorityFilter === "all" || doc.priority === priorityFilter;
    return matchName && matchPriority;
  });

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 flex-col">
        <h2 className="text-xl font-bold mb-8">📂 Dashboard</h2>
        {[
          {
            key: "upload",
            label: "Document Upload",
            icon: <Upload size={18} />,
          },
          { key: "login", label: "Login / Logout", icon: <LogIn size={18} /> },
          { key: "settings", label: "Settings", icon: <Settings size={18} /> },
        ].map((item) => (
          <button
            key={item.key}
            className={`flex items-center gap-2 p-2 rounded mb-2 transition ${
              active === item.key ? "bg-gray-700" : "hover:bg-gray-700/50"
            }`}
            onClick={() => {
              setActive(item.key);
              setSelectedDocId(null);
            }}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {active === "upload" && (
          <div>
            {/* Topbar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
              <input
                type="file"
                onChange={handleUpload}
                className="border p-2 rounded w-full sm:w-auto"
              />

              <input
                type="text"
                placeholder="🔍 Search documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border p-2 rounded flex-1"
              />

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Document Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocs.length ? (
                filteredDocs.map((doc) => {
                  const isSelected = selectedDocId === doc.id;
                  return (
                    <div
                      key={doc.id}
                      className={`relative p-4 rounded-xl transition cursor-pointer group
    bg-black/40 backdrop-blur-lg border border-white/10 shadow-xl 
    hover:scale-105 hover:shadow-2xl hover:z-50`}
                      onClick={() =>
                        setSelectedDocId(isSelected ? null : doc.id)
                      }
                    >
                      {/* File Header */}
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                          <FileText size={18} /> {doc.name}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            priorityColors[doc.priority]
                          }`}
                        >
                          {doc.priority}
                        </span>
                      </div>

                      {/* Change priority (only when selected) */}
                      {isSelected && (
                        <div className="mt-3">
                          <label className="block text-sm text-gray-300">
                            Change Priority:
                          </label>
                          <select
                            value={doc.priority}
                            onChange={(e) =>
                              handlePriorityChange(doc.id, e.target.value)
                            }
                            className="mt-1 border rounded p-1 w-full text-sm bg-gray-900 text-white"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                        </div>
                      )}

                      {/* Hover Glass Preview */}
                      <div className="absolute top-full mt-3 left-0 hidden group-hover:block z-50 w-64">
                        <div className="backdrop-blur-lg bg-black/80 border border-white/10 text-white p-4 rounded-xl shadow-2xl">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <AlertCircle size={16} /> Preview
                          </h4>
                          <p className="text-sm">{doc.preview}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500">No documents found</p>
              )}
            </div>
          </div>
        )}

        {/* Login Section */}
        {active === "login" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Login / Logout</h2>
            <button className="bg-green-600 px-4 py-2 rounded mr-2 text-white">
              Login
            </button>
            <button className="bg-red-600 px-4 py-2 rounded text-white">
              Logout
            </button>
          </div>
        )}

        {/* Settings Section */}
        {active === "settings" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <label className="block mb-2">Change Username:</label>
            <input type="text" className="border p-2 mb-4 w-full rounded" />
            <button className="bg-blue-600 px-4 py-2 rounded text-white">
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
