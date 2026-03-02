// API Service - Comunicación con backend Vita360
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Types
export interface Ticket {
  id: number;
  title: string;
  description: string;
  priority_score: number;
  urgency_level: string;
  status: string;
  area_name: string;
  created_at: string;
  user_id: number;
}

export interface Evidence {
  id: number;
  ticket_id: number;
  image_url: string;
  description?: string;
  created_at: string;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  // Geolocalización (enviada al backend para GIS lookup)
  lat?: number | null;
  lng?: number | null;
  timestamp?: string | null;
  // Foto (máx 1) integrada a la solicitud. URL o DataURL (base64)
  image_url?: string | null;
}

// Respuesta real del backend al crear ticket (ver main.py)
export interface CreateTicketResponse {
  id: number;
  ticket_id: number;
  area: string;
  priority: number;         // score 0-100
  urgency_level: string;    // Alta / Media / Baja
  planned_date: string;
  evidence_id: number | null;
  metrics: {
    riesgo_seguridad: number;
    urgencia: number;
    impacto: number;
    sla_legal: number;
    vulnerabilidad_lugar: number;
  };
  location_context: {
    near_school: boolean;
    near_hospital: boolean;
    near_high_traffic: boolean;
    in_critical_zone: boolean;
  };
  reasoning: string;
}

export interface DashboardStats {
  total_open: number;
  resolved_first_contact_percentage: number;
  avg_response_time: number;
  at_risk_count: number;
}

// 🔥 CORREGIDO: Helper para obtener token desde localStorage
const getToken = (): string | null => {
  // IMPORTANTE: Debe coincidir con AuthContext.tsx que usa 'vita360_token'
  return localStorage.getItem('vita360_token');
};

// Headers con autenticación
const getHeaders = (includeAuth = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// ─── USUARIOS ───────────────────────────────────────────────────────────────

export const apiAuth = {
  login: async (email: string, password: string) => {
    // 🔥 CORREGIDO: El backend espera application/x-www-form-urlencoded
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();
    return data;
  },

  register: async (name: string, email: string, password: string, role: 'ciudadano' | 'operador' = 'ciudadano') => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ name, email, password, role }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    return await response.json();
  },
};

// ─── TICKETS (CASOS/PROBLEMAS) ───────────────────────────────────────────────

export const apiTickets = {
  // Crear nuevo ticket (ciudadano reporta un problema)
  create: async (payload: CreateTicketPayload & Record<string, any>): Promise<CreateTicketResponse> => {
    const response = await fetch(`${API_BASE_URL}/tickets`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create ticket');
    }

    return await response.json();
  },

  // Obtener todos los tickets del usuario actual
  getMyTickets: async () => {
    const response = await fetch(`${API_BASE_URL}/my-tickets`, {
      headers: getHeaders(true),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch tickets');
    }

    return await response.json();
  },

  // Obtener ticket específico
  getById: async (ticketId: number) => {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch ticket');
    }

    return await response.json();
  },

  // Obtener todos los tickets (solo operadores)
  getAll: async (status?: string, area?: string) => {
    let url = `${API_BASE_URL}/tickets`;
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (area) params.append('area', area);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tickets');
    }

    return await response.json();
  },

  // Actualizar ticket
  update: async (ticketId: number, data: Partial<CreateTicketPayload> & { status?: string }) => {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update ticket');
    }

    return await response.json();
  },

  // Eliminar ticket
  delete: async (ticketId: number) => {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to delete ticket');
    }
  },
};

// ─── EVIDENCIA (FOTOS) ───────────────────────────────────────────────────────

export const apiEvidence = {
  // Subir evidencia (foto) a un ticket
  upload: async (ticketId: number, imageBase64: string, description?: string) => {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/evidence`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({
        image_url: imageBase64,
        description,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to upload evidence');
    }

    return await response.json();
  },

  // Obtener todas las evidencias de un ticket
  getByTicket: async (ticketId: number): Promise<Evidence[]> => {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/evidence`, {
      headers: getHeaders(true),
    });

    if (!response.ok) {
      return [];
    }

    return await response.json();
  },

  // Eliminar evidencia
  delete: async (evidenceId: number) => {
    const response = await fetch(`${API_BASE_URL}/evidence/${evidenceId}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to delete evidence');
    }
  },
};

// ─── ESTADÍSTICAS ───────────────────────────────────────────────────────────

export const apiStats = {
  // Obtener estadísticas del dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await fetch(`${API_BASE_URL}/stats/dashboard`, {
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }

    return await response.json();
  },

  // Obtener reportes por área
  getAreaStats: async () => {
    const response = await fetch(`${API_BASE_URL}/stats/areas`, {
      headers: getHeaders(true),
    });

    if (!response.ok) {
      return {};
    }

    return await response.json();
  },
};

// ─── ÁREAS ──────────────────────────────────────────────────────────────────

export const apiAreas = {
  // Obtener todas las áreas
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/areas`, {
      headers: getHeaders(true),
    });

    if (!response.ok) {
      return [];
    }

    return await response.json();
  },
};

// ─── HELPER: Convertir imagen a Base64 ──────────────────────────────────────

export const imageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// ─── HELPER: Compresión de imagen ──────────────────────────────────────────
// Reduce a 640px máximo de ancho y usa WebP (≈30% más ligero que JPEG).
// Si el navegador no soporta WebP encoding (Safari antiguo) cae a JPEG.

export const compressImage = (base64: string, maxWidth = 640, quality = 0.65): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, 1);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);

      const ctx = canvas.getContext('2d');
      if (ctx) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Intentar WebP primero; fallback a JPEG
      const webp = canvas.toDataURL('image/webp', quality);
      resolve(webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', quality));
    };
    img.src = base64;
  });
};
