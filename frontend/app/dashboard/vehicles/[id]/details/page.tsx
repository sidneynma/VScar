"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Car,
  ArrowLeft,
  Pencil,
  Image as ImageIcon,
  Calendar,
  Gauge,
  Fuel,
  Palette,
  Settings2,
  DollarSign,
  FileText,
  Tag,
  Clock,
} from "lucide-react";

interface Vehicle {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  status: string;
  mileage: number;
  color: string;
  fuel_type: string;
  transmission: string;
  description: string;
  doors: number;
  vehicle_type: string;
  interior_color: string;
  created_at: string;
  updated_at: string;
}

export default function VehicleDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }
    fetchVehicle();
  }, [params.id]);

  const fetchVehicle = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/vehicles/${params.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setVehicle(await res.json());
      } else {
        setError("Veiculo nao encontrado");
      }
    } catch (err) {
      setError("Erro ao carregar veiculo");
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <span className="badge badge-green">Disponivel</span>;
      case "inactive":
        return <span className="badge badge-yellow">Inativo</span>;
      case "reserved":
        return <span className="badge badge-blue">Reservado</span>;
      case "sold":
        return <span className="badge badge-red">Vendido</span>;
      case "archived":
        return <span className="badge badge-red">Arquivado</span>;
      default:
        return <span className="badge badge-gray">{status}</span>;
    }
  };

  const formatPrice = (price: number) => {
    if (!price) return "Sob consulta";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(price));
  };

  const formatDate = (date: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fuelLabel = (fuel: string) => {
    const map: Record<string, string> = {
      gasoline: "Gasolina",
      ethanol: "Etanol",
      flex: "Flex",
      diesel: "Diesel",
      electric: "Eletrico",
      hybrid: "Hibrido",
    };
    return map[fuel] || fuel || "-";
  };

  const transmissionLabel = (t: string) => {
    const map: Record<string, string> = {
      automatic: "Automatico",
      manual: "Manual",
      cvt: "CVT",
    };
    return map[t] || t || "-";
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ minHeight: "50vh" }}
      >
        <div className="spinner" />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div>
        <div className="card">
          <div className="empty-state">
            <Car
              className="w-10 h-10 mx-auto"
              style={{ color: "var(--text-muted)" }}
            />
            <p>{error || "Veiculo nao encontrado"}</p>
            <Link
              href="/dashboard/vehicles"
              className="btn-primary mt-4 inline-flex"
            >
              Voltar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/vehicles")}
            className="btn-secondary"
            style={{ padding: "0.5rem" }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">
              {vehicle.title || `${vehicle.brand} ${vehicle.model}`}
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--text-secondary)" }}
            >
              {vehicle.brand} {vehicle.model} - {vehicle.year}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {statusBadge(vehicle.status)}
          <Link
            href={`/dashboard/vehicles/${vehicle.id}`}
            className="btn-primary"
          >
            <Pencil className="w-4 h-4" />
            Editar
          </Link>
          <Link
            href={`/dashboard/vehicles/${vehicle.id}/images`}
            className="btn-secondary"
          >
            <ImageIcon className="w-4 h-4" />
            Fotos
          </Link>
        </div>
      </div>

      {/* Price card */}
      <div
        className="card mb-6"
        style={{ borderLeft: "4px solid var(--accent-blue)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-lg"
            style={{
              width: "3rem",
              height: "3rem",
              backgroundColor: "rgba(47, 129, 247, 0.1)",
            }}
          >
            <DollarSign
              className="w-6 h-6"
              style={{ color: "var(--accent-blue)" }}
            />
          </div>
          <div>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Preco
            </p>
            <p
              className="text-2xl font-bold"
              style={{ color: "var(--accent-blue)" }}
            >
              {formatPrice(vehicle.price)}
            </p>
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {/* Informacoes Basicas */}
        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Car className="w-4 h-4" style={{ color: "var(--accent-blue)" }} />
            Informacoes Basicas
          </h3>
          <div className="flex flex-col gap-3">
            <DetailRow
              icon={<Tag className="w-4 h-4" />}
              label="Marca"
              value={vehicle.brand || "-"}
            />
            <DetailRow
              icon={<Car className="w-4 h-4" />}
              label="Modelo"
              value={vehicle.model || "-"}
            />
            <DetailRow
              icon={<Calendar className="w-4 h-4" />}
              label="Ano"
              value={String(vehicle.year || "-")}
            />
            <DetailRow
              icon={<Palette className="w-4 h-4" />}
              label="Cor"
              value={vehicle.color || "-"}
            />
            <DetailRow
              icon={<Palette className="w-4 h-4" />}
              label="Cor Interna"
              value={vehicle.interior_color || "-"}
            />
            <DetailRow
              icon={<FileText className="w-4 h-4" />}
              label="Tipo"
              value={vehicle.vehicle_type || "-"}
            />
            <DetailRow
              icon={<Settings2 className="w-4 h-4" />}
              label="Portas"
              value={String(vehicle.doors || "-")}
            />
          </div>
        </div>

        {/* Especificacoes Tecnicas */}
        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Settings2
              className="w-4 h-4"
              style={{ color: "var(--accent-green-light)" }}
            />
            Especificacoes Tecnicas
          </h3>
          <div className="flex flex-col gap-3">
            <DetailRow
              icon={<Gauge className="w-4 h-4" />}
              label="Quilometragem"
              value={
                vehicle.mileage
                  ? `${vehicle.mileage.toLocaleString("pt-BR")} km`
                  : "-"
              }
            />
            <DetailRow
              icon={<Fuel className="w-4 h-4" />}
              label="Combustivel"
              value={fuelLabel(vehicle.fuel_type)}
            />
            <DetailRow
              icon={<Settings2 className="w-4 h-4" />}
              label="Transmissao"
              value={transmissionLabel(vehicle.transmission)}
            />
          </div>
        </div>

        {/* Datas */}
        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock
              className="w-4 h-4"
              style={{ color: "var(--accent-yellow)" }}
            />
            Datas
          </h3>
          <div className="flex flex-col gap-3">
            <DetailRow
              icon={<Calendar className="w-4 h-4" />}
              label="Cadastrado em"
              value={formatDate(vehicle.created_at)}
            />
            <DetailRow
              icon={<Clock className="w-4 h-4" />}
              label="Atualizado em"
              value={formatDate(vehicle.updated_at)}
            />
          </div>
        </div>
      </div>

      {/* Descricao */}
      {vehicle.description && (
        <div className="card mt-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <FileText
              className="w-4 h-4"
              style={{ color: "var(--accent-purple)" }}
            />
            Descricao
          </h3>
          <p
            style={{
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}
          >
            {vehicle.description}
          </p>
        </div>
      )}
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        padding: "0.5rem 0",
        borderBottom: "1px solid var(--border-light)",
      }}
    >
      <div
        className="flex items-center gap-2"
        style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}
      >
        {icon}
        {label}
      </div>
      <span className="font-medium" style={{ fontSize: "0.875rem" }}>
        {value}
      </span>
    </div>
  );
}
