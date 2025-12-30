"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import LoadingBee from "@/components/LoadingBee";
import { useConfirmDialog } from "@/components/ConfirmDialog";
import { useNotification } from "@/components/NotificationToast";

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
  const { showConfirm, ConfirmDialogComponent } = useConfirmDialog();
  const { showNotification, NotificationContainer } = useNotification();

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
          showNotification("No tienes permiso para gestionar este roadmap", "error");
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
        
        showNotification("Error al cargar el roadmap", "error");
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
        showNotification(
          `No se puede agregar: excedería el monto objetivo. Total actual: ${currentTotal.toFixed(2)} XLM + Nuevo: ${newItemCost.toFixed(2)} XLM = ${newTotal.toFixed(2)} XLM (Meta: ${goalAmount.toFixed(2)} XLM)`,
          "warning"
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
        router.refresh();
        showNotification("¡Hito agregado exitosamente!", "success");
      } else {
        const error = await res.json();
        showNotification(`Error: ${error.error}`, "error");
      }
    } catch (error) {
      
      showNotification("Error al agregar hito del roadmap", "error");
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
        showNotification(
          `No se puede actualizar: excedería el monto objetivo. Otros items: ${currentTotal.toFixed(2)} XLM + Este: ${newItemCost.toFixed(2)} XLM = ${newTotal.toFixed(2)} XLM (Meta: ${goalAmount.toFixed(2)} XLM)`,
          "warning"
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
        router.refresh();
        showNotification("¡Hito actualizado exitosamente!", "success");
      } else {
        const error = await res.json();
        showNotification(`Error: ${error.error}`, "error");
      }
    } catch (error) {
      
      showNotification("Error al actualizar hito del roadmap", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    const confirmed = await showConfirm(
      "Eliminar hito",
      "¿Estás seguro de que quieres eliminar este hito del roadmap? Esta acción no se puede deshacer.",
      {
        confirmText: "Eliminar",
        cancelText: "Cancelar",
        type: "danger",
      }
    );
    
    if (!confirmed) {
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
        router.refresh();
        showNotification("¡Hito eliminado exitosamente!", "success");
      } else {
        const error = await res.json();
        showNotification(`Error: ${error.error}`, "error");
      }
    } catch (error) {
      
      showNotification("Error al eliminar hito del roadmap", "error");
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
    return <LoadingBee text="Cargando roadmap..." />;
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border-4 border-black p-8 shadow-[6px_6px_0px_#000] text-center">
          <p className="text-xl font-bold mb-4">Proyecto no encontrado</p>
          <Link href="/projects" className="btn-brutal btn-brutal-primary">
            Ver Proyectos
          </Link>
        </div>
      </div>
    );
  }

  const currentTotal = items.reduce((sum, item) => sum + parseFloat(item.estimated_cost || "0"), 0);
  const goalAmount = project.goal_amount ? parseFloat(project.goal_amount) : 0;
  const remaining = goalAmount - currentTotal;
  const percentage = goalAmount > 0 ? (currentTotal / goalAmount) * 100 : 0;

  return (
    <>
      {ConfirmDialogComponent}
      {NotificationContainer}
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href={`/projects/${params.id}`}
            className="inline-flex items-center gap-2 text-sm font-bold hover:underline mb-4"
          >
            ← VOLVER AL PROYECTO
          </Link>
          <h1 className="text-4xl font-bold">GESTIONAR ROADMAP</h1>
          <p className="text-gray-500 mt-2">
            Proyecto: <strong>{project.title}</strong>
          </p>
        </motion.div>

        {/* Budget Summary */}
        {project.goal_amount && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`border-4 border-black p-6 shadow-[6px_6px_0px_#000] mb-8 ${
              percentage >= 100
                ? "bg-red-100"
                : percentage >= 80
                  ? "bg-[#FDCB6E]"
                  : "bg-green-100"
            }`}
          >
            <h3 className="font-bold text-lg mb-4">📊 RESUMEN DE PRESUPUESTO</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-white border-2 border-black p-3 text-center">
                <p className="text-2xl font-bold">${goalAmount.toFixed(0)}</p>
                <p className="text-xs text-gray-500">Meta</p>
              </div>
              <div className="bg-white border-2 border-black p-3 text-center">
                <p className="text-2xl font-bold text-[#E67E22]">${currentTotal.toFixed(0)}</p>
                <p className="text-xs text-gray-500">Asignado ({percentage.toFixed(0)}%)</p>
              </div>
              <div className="bg-white border-2 border-black p-3 text-center">
                <p className={`text-2xl font-bold ${remaining >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ${remaining.toFixed(0)}
                </p>
                <p className="text-xs text-gray-500">Restante</p>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="h-4 bg-white border-2 border-black">
              <div
                className={`h-full ${percentage >= 100 ? "bg-red-400" : "bg-[#FDCB6E]"}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            {percentage >= 100 && (
              <p className="text-sm text-red-700 mt-2 font-bold">
                ⚠️ Límite de presupuesto alcanzado
              </p>
            )}
          </motion.div>
        )}

        {/* Add/Edit Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_#000] mb-8"
        >
          <h2 className="text-xl font-bold mb-6 pb-4 border-b-4 border-black">
            {editingId ? "✏️ EDITAR HITO" : "➕ AGREGAR NUEVO HITO"}
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
            className="space-y-4"
          >
            <div>
              <label className="block font-bold text-sm mb-2 uppercase">
                Título *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Fase 1: Desarrollo"
                className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-2 focus:ring-[#FDCB6E]"
              />
            </div>

            <div>
              <label className="block font-bold text-sm mb-2 uppercase">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe lo que se logrará en esta fase..."
                rows={3}
                className="w-full px-4 py-3 border-4 border-black focus:outline-none focus:ring-2 focus:ring-[#FDCB6E] resize-none"
              />
            </div>

            <div>
              <label className="block font-bold text-sm mb-2 uppercase">
                Costo Estimado
                {project.goal_amount && (
                  <span className="text-xs text-gray-500 font-normal ml-2">
                    (Máx: ${remaining.toFixed(0)})
                  </span>
                )}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                  placeholder="1000"
                  className="w-full pl-10 pr-4 py-3 border-4 border-black focus:outline-none focus:ring-2 focus:ring-[#FDCB6E]"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 bg-[#FDCB6E] border-4 border-black font-bold shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] transition-shadow disabled:opacity-50"
              >
                {saving ? "GUARDANDO..." : editingId ? "ACTUALIZAR" : "AGREGAR HITO"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="py-3 px-6 bg-white border-4 border-black font-bold hover:bg-gray-100"
                >
                  CANCELAR
                </button>
              )}
            </div>
          </form>
        </motion.div>

        {/* Roadmap Items List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-4">
            ROADMAP ACTUAL ({items.length} hitos)
          </h2>
          
          {items.length === 0 ? (
            <div className="bg-[#FDCB6E] border-4 border-black p-8 shadow-[6px_6px_0px_#000] text-center">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="font-bold text-xl mb-2">Sin hitos aún</h3>
              <p className="text-black/70">
                Agrega tu primer hito para mostrar a los donantes el plan de tu proyecto
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_#000]"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-8 h-8 bg-[#FDCB6E] border-2 border-black flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </span>
                        <h3 className="font-bold text-lg">{item.title}</h3>
                      </div>
                      {item.description && (
                        <p className="text-gray-600 text-sm mb-2 ml-11">
                          {item.description}
                        </p>
                      )}
                      {item.estimated_cost && (
                        <p className="text-[#E67E22] font-bold ml-11">
                          💰 ${item.estimated_cost}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(item)}
                        className="px-3 py-2 bg-white border-2 border-black font-bold text-sm hover:bg-gray-100"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-2 bg-red-100 border-2 border-red-500 text-red-600 font-bold text-sm hover:bg-red-200"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
    </>
  );
}
