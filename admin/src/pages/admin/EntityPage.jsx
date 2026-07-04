import React from "react";
import { Icon } from "@iconify/react";
import { Navigate, useParams } from "react-router-dom";
import MasterLayout from "../../masterLayout/MasterLayout";
import Breadcrumb from "../../components/Breadcrumb";
import SchemaDataTable from "../../components/admin/SchemaDataTable";
import { entityConfigs } from "../../data/adminSchema";

const EntityPage = () => {
  const { entityKey } = useParams();
  const config = entityConfigs[entityKey];

  if (!config) return <Navigate to="/" replace />;

  const pendingKey = config.rows.some((row) => row.verification_status !== undefined) ? "verification_status" : "status";
  const pending = config.rows.filter((row) => row[pendingKey] === "pending").length;

  return (
    <MasterLayout>
      <Breadcrumb title={config.title} />
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-24">
        <div>
          <div className="d-flex align-items-center gap-10 mb-8">
            <span className="w-40-px h-40-px rounded-circle bg-primary-50 text-primary-600 d-flex align-items-center justify-content-center">
              <Icon icon={config.icon} className="text-xl" />
            </span>
            <div>
              <h4 className="mb-0">{config.title}</h4>
              <code className="text-xs">{config.tableName}</code>
            </div>
          </div>
          <p className="text-secondary-light mb-0 max-w-700-px">{config.description}</p>
        </div>
        <div className="d-flex gap-2">
          <div className="bg-base border radius-12 px-16 py-10">
            <span className="text-xs text-secondary-light d-block">Records</span>
            <strong className="text-lg">{config.rows.length}</strong>
          </div>
          {pending > 0 && (
            <div className="bg-warning-focus border border-warning-200 radius-12 px-16 py-10">
              <span className="text-xs text-warning-main d-block">Pending</span>
              <strong className="text-lg text-warning-main">{pending}</strong>
            </div>
          )}
        </div>
      </div>
      <SchemaDataTable config={config} />
    </MasterLayout>
  );
};

export default EntityPage;
