import React from "react";
import { Icon } from "@iconify/react";

interface Props {
  title: string;
  description: string;
  icon?: string;
  actions?: React.ReactNode;
}

const PageHeader = ({ title, description, icon = "solar:document-text-outline", actions }: Props) => (
  <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-24">
    <div className="d-flex align-items-start gap-12">
      <span className="w-44-px h-44-px rounded-circle bg-primary-50 text-primary-600 d-flex align-items-center justify-content-center flex-shrink-0">
        <Icon icon={icon} className="text-xl" />
      </span>
      <div>
        <h4 className="mb-6">{title}</h4>
        <p className="text-secondary-light mb-0">{description}</p>
      </div>
    </div>
    {actions && <div className="d-flex flex-wrap gap-2">{actions}</div>}
  </div>
);

export default PageHeader;
