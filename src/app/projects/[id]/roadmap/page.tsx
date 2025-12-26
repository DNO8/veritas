"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

interface RoadmapItem {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  estimated_cost: string | null;
  order_index: number;
}

export default function ManageRoadmapPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    estimatedCost: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Verificar autenticación
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        // Obtener proyecto
        const res = await fetch(`/api/projects/${params.id}`, {
          credentials: "include",
        });
        const data = await res.json();

        // Verificar ownership
        if (data.project.owner_id !== user.id) {
          alert("You don't have permission to manage this roadmap");
          router.push(`/projects/${params.id}`);
          return;
        }

        setProject(data.project);

        // Obtener roadmap items
        const roadmapRes = await fetch(`/api/projects/${params.id}/roadmap`, {
          credentials: "include",
        });
        if (roadmapRes.ok) {
          const roadmapData = await roadmapRes.json();
          setItems(roadmapData.items || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to load roadmap");
        router.push("/projects");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que no se exceda el goal_amount
    if (project.goal_amount && formData.estimatedCost) {
      const currentTotal = items.reduce((sum, item) => {
        return sum + parseFloat(item.estimated_cost || "0");
      }, 0);
      const newItemCost = parseFloat(formData.estimatedCost);
      const newTotal = currentTotal + newItemCost;
      const goalAmount = parseFloat(project.goal_amount);

      if (newTotal > goalAmount) {
        alert(
          `❌ Cannot add item\n\n` +
            `This would exceed the project goal amount.\n\n` +
            `Current total: ${currentTotal.toFixed(2)} XLM\n` +
            `New item cost: ${newItemCost.toFixed(2)} XLM\n` +
            `New total: ${newTotal.toFixed(2)} XLM\n` +
            `Goal amount: ${goalAmount.toFixed(2)} XLM\n\n` +
            `Remaining budget: ${(goalAmount - currentTotal).toFixed(2)} XLM`,
        );
        return;
      }
    }

    setSaving(true);

    try {
      const res = await fetch(`/api/projects/${params.id}/roadmap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          estimatedCost: formData.estimatedCost
            ? String(formData.estimatedCost)
            : null,
          orderIndex: items.length,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setItems([...items, data.item]);
        setFormData({ title: "", description: "", estimatedCost: "" });
        alert("Roadmap item added!");
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Failed to add roadmap item");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (itemId: string) => {
    // Validar que no se exceda el goal_amount al editar
    if (project.goal_amount && formData.estimatedCost) {
      const currentTotal = items.reduce((sum, item) => {
        // Excluir el item que estamos editando del cálculo
        if (item.id === itemId) return sum;
        return sum + parseFloat(item.estimated_cost || "0");
      }, 0);
      const newItemCost = parseFloat(formData.estimatedCost);
      const newTotal = currentTotal + newItemCost;
      const goalAmount = parseFloat(project.goal_amount);

      if (newTotal > goalAmount) {
        alert(
          `❌ Cannot update item\n\n` +
            `This would exceed the project goal amount.\n\n` +
            `Other items total: ${currentTotal.toFixed(2)} XLM\n` +
            `This item cost: ${newItemCost.toFixed(2)} XLM\n` +
            `New total: ${newTotal.toFixed(2)} XLM\n` +
            `Goal amount: ${goalAmount.toFixed(2)} XLM\n\n` +
            `Remaining budget: ${(goalAmount - currentTotal).toFixed(2)} XLM`,
        );
        return;
      }
    }

    setSaving(true);

    try {
      const res = await fetch(`/api/projects/${params.id}/roadmap`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          itemId: itemId,
          title: formData.title,
          description: formData.description || null,
          estimatedCost: formData.estimatedCost
            ? String(formData.estimatedCost)
            : null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setItems(items.map((item) => (item.id === itemId ? data.item : item)));
        setEditingId(null);
        setFormData({ title: "", description: "", estimatedCost: "" });
        alert("Roadmap item updated!");
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error updating item:", error);
      alert("Failed to update roadmap item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this roadmap item?")) {
      return;
    }

    try {
      const res = await fetch(
        `/api/projects/${params.id}/roadmap?itemId=${itemId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (res.ok) {
        setItems(items.filter((item) => item.id !== itemId));
        alert("Roadmap item deleted!");
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete roadmap item");
    }
  };

  const startEdit = (item: RoadmapItem) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      description: item.description || "",
      estimatedCost: item.estimated_cost || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: "", description: "", estimatedCost: "" });
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  if (!project) {
    return <div style={{ padding: "20px" }}>Project not found</div>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ marginBottom: "30px" }}>
        <button
          onClick={() => router.push(`/projects/${params.id}`)}
          style={{
            padding: "8px 16px",
            background: "#f0f0f0",
            border: "1px solid #ddd",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          ← Back to Project
        </button>
      </div>

      <h1>Manage Roadmap</h1>
      <p style={{ color: "#666", marginBottom: "10px" }}>
        Project: <strong>{project.title}</strong>
      </p>

      {/* Budget Summary */}
      {project.goal_amount && (
        <div
          style={{
            padding: "15px",
            background: (() => {
              const currentTotal = items.reduce((sum, item) => {
                return sum + parseFloat(item.estimated_cost || "0");
              }, 0);
              const goalAmount = parseFloat(project.goal_amount);
              const percentage = (currentTotal / goalAmount) * 100;

              if (percentage >= 100) return "#f8d7da";
              if (percentage >= 80) return "#fff3cd";
              return "#d4edda";
            })(),
            border: "1px solid",
            borderColor: (() => {
              const currentTotal = items.reduce((sum, item) => {
                return sum + parseFloat(item.estimated_cost || "0");
              }, 0);
              const goalAmount = parseFloat(project.goal_amount);
              const percentage = (currentTotal / goalAmount) * 100;

              if (percentage >= 100) return "#f5c6cb";
              if (percentage >= 80) return "#ffc107";
              return "#c3e6cb";
            })(),
            borderRadius: "8px",
            marginBottom: "30px",
          }}
        >
          {(() => {
            const currentTotal = items.reduce((sum, item) => {
              return sum + parseFloat(item.estimated_cost || "0");
            }, 0);
            const goalAmount = parseFloat(project.goal_amount);
            const remaining = goalAmount - currentTotal;
            const percentage = (currentTotal / goalAmount) * 100;

            return (
              <>
                <div style={{ marginBottom: "10px" }}>
                  <strong>Budget Overview:</strong>
                </div>
                <div style={{ fontSize: "14px" }}>
                  <p style={{ margin: "5px 0" }}>
                    💰 Goal Amount: <strong>{goalAmount.toFixed(2)} XLM</strong>
                  </p>
                  <p style={{ margin: "5px 0" }}>
                    📊 Allocated: <strong>{currentTotal.toFixed(2)} XLM</strong>{" "}
                    ({percentage.toFixed(1)}%)
                  </p>
                  <p style={{ margin: "5px 0" }}>
                    {remaining >= 0 ? "✅" : "❌"} Remaining:{" "}
                    <strong>{remaining.toFixed(2)} XLM</strong>
                  </p>
                </div>
                {percentage >= 100 && (
                  <p
                    style={{
                      margin: "10px 0 0 0",
                      fontSize: "13px",
                      color: "#721c24",
                    }}
                  >
                    ⚠️ Budget limit reached. Remove or reduce items to add more.
                  </p>
                )}
                {percentage >= 80 && percentage < 100 && (
                  <p
                    style={{
                      margin: "10px 0 0 0",
                      fontSize: "13px",
                      color: "#856404",
                    }}
                  >
                    ⚠️ Approaching budget limit. Only {remaining.toFixed(2)} XLM
                    remaining.
                  </p>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Add/Edit Form */}
      <div
        style={{
          background: "#f9f9f9",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "30px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>
          {editingId ? "Edit Roadmap Item" : "Add New Roadmap Item"}
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (editingId) {
              handleUpdate(editingId);
            } else {
              handleAdd(e);
            }
          }}
        >
          <div style={{ marginBottom: "15px" }}>
            <label
              htmlFor="title"
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "500",
              }}
            >
              Title *
            </label>
            <input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Phase 1: Development"
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "16px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label
              htmlFor="description"
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "500",
              }}
            >
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe what will be accomplished in this phase..."
              rows={3}
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "16px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label
              htmlFor="estimatedCost"
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "500",
              }}
            >
              Estimated Cost (XLM)
              {project.goal_amount && (
                <span
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    fontWeight: "normal",
                  }}
                >
                  {" "}
                  (Max: {(() => {
                    const currentTotal = items.reduce((sum, item) => {
                      if (editingId && item.id === editingId) return sum;
                      return sum + parseFloat(item.estimated_cost || "0");
                    }, 0);
                    const goalAmount = parseFloat(project.goal_amount);
                    const remaining = goalAmount - currentTotal;
                    return remaining.toFixed(2);
                  })()} XLM)
                </span>
              )}
            </label>
            <input
              id="estimatedCost"
              type="number"
              step="0.01"
              min="0"
              max={
                project.goal_amount
                  ? (() => {
                      const currentTotal = items.reduce((sum, item) => {
                        if (editingId && item.id === editingId) return sum;
                        return sum + parseFloat(item.estimated_cost || "0");
                      }, 0);
                      const goalAmount = parseFloat(project.goal_amount);
                      return goalAmount - currentTotal;
                    })()
                  : undefined
              }
              value={formData.estimatedCost}
              onChange={(e) =>
                setFormData({ ...formData, estimatedCost: e.target.value })
              }
              placeholder="1000"
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "16px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "10px 20px",
                background: saving ? "#ccc" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: saving ? "not-allowed" : "pointer",
                fontWeight: "500",
              }}
            >
              {saving ? "Saving..." : editingId ? "Update Item" : "Add Item"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                style={{
                  padding: "10px 20px",
                  background: "white",
                  color: "#666",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Roadmap Items List */}
      <div>
        <h2>Current Roadmap ({items.length} items)</h2>
        {items.length === 0 ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              background: "#f9f9f9",
              borderRadius: "8px",
              color: "#666",
            }}
          >
            <p style={{ fontSize: "18px", marginBottom: "10px" }}>
              📋 No roadmap items yet
            </p>
            <p style={{ fontSize: "14px" }}>
              Add your first roadmap item to show donors your project plan
            </p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            {items.map((item, index) => (
              <div
                key={item.id}
                style={{
                  background: "white",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "10px",
                      }}
                    >
                      <span
                        style={{
                          background: "#0070f3",
                          color: "white",
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          fontSize: "14px",
                        }}
                      >
                        {index + 1}
                      </span>
                      <h3 style={{ margin: 0 }}>{item.title}</h3>
                    </div>
                    {item.description && (
                      <p style={{ color: "#666", margin: "10px 0" }}>
                        {item.description}
                      </p>
                    )}
                    {item.estimated_cost && (
                      <p
                        style={{
                          color: "#28a745",
                          fontWeight: "500",
                          margin: "10px 0 0 0",
                        }}
                      >
                        💰 Estimated Cost: {item.estimated_cost} XLM
                      </p>
                    )}
                  </div>
                  <div
                    style={{ display: "flex", gap: "10px", marginLeft: "20px" }}
                  >
                    <button
                      onClick={() => startEdit(item)}
                      style={{
                        padding: "8px 16px",
                        background: "#0070f3",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{
                        padding: "8px 16px",
                        background: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
