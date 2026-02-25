import { 
  AlertTriangle, 
  Clock, 
  Check, 
  Filter, 
  ChevronDown,
  MapPin,
  FileQuestion,
  Zap
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { mockCases } from '../data/mockData';
import { Link } from 'react-router';

// Tipos de iconos por tipo de caso
const caseTypeIcons: Record<string, any> = {
  'Árbol en Riesgo': AlertTriangle,
  'Bache en Calle': MapPin,
  'Consulta General': FileQuestion,
  'Reclamo Basura': AlertTriangle,
  'Semáforo Roto': AlertTriangle,
};

const mapUrgencyToLabel = (urgency: number): string => {
  if (urgency >= 80) return 'Crítica';
  if (urgency >= 60) return 'Alta';
  return 'Media';
};

const mapUrgencyToColor = (urgency: number): string => {
  if (urgency >= 80) return 'bg-[#DA4F44]';
  if (urgency >= 60) return 'bg-[#F2B23A]';
  return 'bg-[#F2A23A]';
};

const mapStatusToColor = (status: string): string => {
  switch (status) {
    case 'resuelto':
      return 'bg-[#48946F]';
    case 'abierto':
      return 'bg-[#DA4F44]';
    case 'en-proceso':
      return 'bg-[#2B5285]';
    default:
      return 'bg-[#98A6B1]';
  }
};

const mapStatusToLabel = (status: string): string => {
  switch (status) {
    case 'abierto':
      return 'Pendiente';
    case 'en-proceso':
      return 'En Gestión';
    case 'resuelto':
      return 'Resuelto';
    default:
      return status;
  }
};

function KPICard({ 
  title, 
  value, 
  color, 
  progress 
}: { 
  title: string; 
  value: string | number; 
  color: string; 
  progress: number;
}) {
  return (
    <div className="bg-white border border-[#E6EAF0] rounded-lg p-5 shadow-[0_2px_8px_rgba(16,24,40,0.06)] flex-1">
      <div className="text-[12px] text-[#6D7783] mb-2">{title}</div>
      <div className={`text-[36px] font-semibold mb-3 ${
        color === 'green' ? 'text-[#48946F]' : 
        color === 'red' ? 'text-[#DA4F44]' : 
        'text-[#2F3A46]'
      }`}>
        {value}
      </div>
      <div className="w-full h-1.5 bg-[#E6EAF0] rounded-full overflow-hidden">
        <div 
          className={`h-full ${
            color === 'green' ? 'bg-[#48946F]' : 
            color === 'red' ? 'bg-[#DA4F44]' : 
            color === 'orange' ? 'bg-[#F2A23A]' :
            'bg-[#306CBB]'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

const TimelineStep = ({ label, completed }: { label: string; completed: boolean }) => (
  <div className="flex items-center gap-2">
    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
      completed ? 'bg-[#48946F]' : 'bg-[#E6EAF0]'
    }`}>
      {completed && <Check size={14} className="text-white" />}
    </div>
    <span className="text-[13px] text-[#6D7783]">{label}</span>
  </div>
);

export default function Dashboard() {
  const [sortBy, setSortBy] = useState<'urgency' | 'sla' | 'date'>('urgency');
  const [filterStatus, setFilterStatus] = useState('todos');

  const casesOpenToday = mockCases.filter(c => {
    const today = new Date('2026-02-23').toDateString();
    return new Date(c.createdAt).toDateString() === today && c.status !== 'cerrado';
  }).length;

  const resolvedFirstContact = 82; // 82% resueltos en primer contacto
  const avgResponseTime = '2h 15m';
  const casesAtRisk = mockCases.filter(c => c.slaRemaining < 12 && c.status !== 'resuelto').length;

  const filteredCases = useMemo(() => {
    let filtered = mockCases.filter(c => {
      if (filterStatus !== 'todos' && c.status !== filterStatus) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'urgency') return b.urgencyAI - a.urgencyAI;
      if (sortBy === 'sla') return a.slaRemaining - b.slaRemaining;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }).slice(0, 5); // Mostrar solo los 5 primeros
  }, [sortBy, filterStatus]);

  return (
    <div>
      {/* KPI Cards */}
      <div className="flex gap-4 mb-6">
        <KPICard title="Casos abiertos hoy" value={casesOpenToday} color="gray" progress={45} />
        <KPICard title="% Resueltos 1er contacto" value={`${resolvedFirstContact}%`} color="green" progress={resolvedFirstContact} />
        <KPICard title="Tiempo Promedio Respuesta" value={avgResponseTime} color="gray" progress={60} />
        <KPICard title="Casos en riesgo SLA" value={casesAtRisk} color="red" progress={35} />
      </div>

      {/* Main Content - Two Columns */}
      <div className="flex gap-6">
        {/* Left Column - Table */}
        <div className="flex-1">
          {/* Controls Strip */}
          <div className="bg-white border border-[#E6EAF0] rounded-lg p-4 mb-4 flex items-center gap-4">
            <button className="flex items-center gap-2 text-[14px] text-[#2F3A46] font-medium hover:text-[#306CBB] transition-colors">
              <Filter size={16} />
              Filtrar
              <ChevronDown size={16} />
            </button>
            <div className="w-px h-6 bg-[#E6EAF0]" />
            <div className="flex items-center gap-2 text-[14px]">
              <span className="text-[#6D7783]">Ordenar por:</span>
              <select 
                value={sortBy} 
                onChange={e => setSortBy(e.target.value as any)}
                className="flex items-center gap-1 text-[#2F3A46] font-medium hover:text-[#306CBB] transition-colors bg-transparent border-0 outline-none cursor-pointer"
              >
                <option value="urgency">Riesgo IA</option>
                <option value="sla">SLA restante</option>
                <option value="date">Más recientes</option>
              </select>
              <ChevronDown size={16} className="text-[#2F3A46]" />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-[#E6EAF0] rounded-lg shadow-[0_2px_8px_rgba(16,24,40,0.06)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F1F3F5] border-b border-[#EEF1F4]">
                  <th className="text-left text-[13px] font-semibold text-[#6D7783] px-4 py-4">ID</th>
                  <th className="text-left text-[13px] font-semibold text-[#6D7783] px-4 py-4">Tipo</th>
                  <th className="text-left text-[13px] font-semibold text-[#6D7783] px-4 py-4">Urgencia</th>
                  <th className="text-left text-[13px] font-semibold text-[#6D7783] px-4 py-4">Área</th>
                  <th className="text-left text-[13px] font-semibold text-[#6D7783] px-4 py-4">SLA Restante</th>
                  <th className="text-left text-[13px] font-semibold text-[#6D7783] px-4 py-4">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((caso) => {
                  const IconComponent = caseTypeIcons[caso.type] || AlertTriangle;
                  const urgencyLabel = mapUrgencyToLabel(caso.urgencyAI);
                  const urgencyColor = mapUrgencyToColor(caso.urgencyAI);
                  const statusColor = mapStatusToColor(caso.status);
                  const statusLabel = mapStatusToLabel(caso.status);

                  return (
                    <tr key={caso.id} className="border-b border-[#EEF1F4] hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-4 py-4">
                        <Link to={`/casos/${caso.id}`} className="text-[14px] font-medium text-[#2F6FB2] hover:underline">
                          {caso.id}
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#306CBB]/10 flex items-center justify-center">
                            <IconComponent size={16} className="text-[#306CBB]" />
                          </div>
                          <span className="text-[14px] font-semibold text-[#2F3A46]">{caso.type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-[13px] font-medium text-white ${urgencyColor}`}>
                          {urgencyLabel}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-[14px] text-[#2F3A46]">{caso.area}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-[14px] text-[#2F3A46]">{caso.slaRemaining}h / {caso.slaTotal}h</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-[13px] font-medium text-white ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Timeline */}
            <div className="px-4 py-4 border-t border-[#EEF1F4] bg-[#FAFBFC]">
              <div className="flex items-center gap-3 mb-3">
                <Clock size={16} className="text-[#6D7783]" />
                <span className="text-[13px] font-semibold text-[#2F3A46]">Línea de tiempo</span>
              </div>
              <div className="flex items-center gap-4">
                <TimelineStep label="Recibido" completed />
                <div className="flex-1 h-px bg-[#E6EAF0]" />
                <TimelineStep label="Asignado" completed />
                <div className="flex-1 h-px bg-[#E6EAF0]" />
                <TimelineStep label="En Gestión" completed />
                <div className="flex-1 h-px bg-[#E6EAF0]" />
                <TimelineStep label="Resuelto" completed={false} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Triage Panel */}
        <div className="w-[380px]">
          <div className="bg-white border border-[#E6EAF0] rounded-lg shadow-[0_2px_8px_rgba(16,24,40,0.06)] p-6">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#306CBB] flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-white" size={16} />
              </div>
              <h2 className="text-[18px] font-semibold text-[#2F3A46]">Triage Automático</h2>
            </div>

            <div className="space-y-5">
              {/* Mensaje del Vecino */}
              <div>
                <label className="block text-[13px] font-semibold text-[#2F3A46] mb-2">
                  Mensaje del Vecino
                </label>
                <div className="bg-[#F3F5F7] border border-[#E6EAF0] rounded-md p-3">
                  <p className="text-[13px] text-[#2F3A46] leading-relaxed">
                    "Hay un árbol en la esquina de Av. Libertador y Calle 25 que tiene ramas muy grandes y está en riesgo de caerse. Ya se cayó una rama pequeña la semana pasada."
                  </p>
                </div>
              </div>

              <div className="h-px bg-[#EEF1F4]" />

              {/* Clasificación */}
              <div>
                <label className="block text-[13px] font-semibold text-[#2F3A46] mb-2">
                  Clasificación
                </label>
                <div className="bg-[#F3F5F7] border border-[#E6EAF0] rounded-md px-3 py-2.5">
                  <span className="text-[14px] text-[#2F3A46]">Árbol en Riesgo</span>
                </div>
              </div>

              {/* Área Sugerida */}
              <div>
                <label className="block text-[13px] font-semibold text-[#2F3A46] mb-2">
                  Área Sugerida
                </label>
                <div className="bg-[#F3F5F7] border border-[#E6EAF0] rounded-md px-3 py-2.5">
                  <span className="text-[14px] text-[#2F3A46]">Espacios Públicos</span>
                </div>
              </div>

              {/* Prioridad */}
              <div>
                <label className="block text-[13px] font-semibold text-[#2F3A46] mb-2">
                  Prioridad
                </label>
                <div className="bg-[#F3F5F7] border border-[#E6EAF0] rounded-md px-3 py-2.5">
                  <span className="inline-block px-3 py-1 rounded-full text-[13px] font-medium text-white bg-[#F2B23A]">
                    Alta
                  </span>
                </div>
              </div>

              <div className="h-px bg-[#EEF1F4]" />

              {/* Respuesta Sugerida */}
              <div>
                <label className="block text-[13px] font-semibold text-[#2F3A46] mb-2">
                  Respuesta Sugerida
                </label>
                <div className="bg-[#F3F5F7] border border-[#E6EAF0] rounded-md p-3 min-h-[120px]">
                  <p className="text-[13px] text-[#2F3A46] leading-relaxed">
                    "Estimado/a vecino/a: Hemos recibido su reporte sobre el árbol en riesgo ubicado en Av. Libertador y Calle 25. El caso ha sido derivado al área de Espacios Públicos para su evaluación inmediata. Un inspector visitará el lugar dentro de las próximas 24 horas."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
