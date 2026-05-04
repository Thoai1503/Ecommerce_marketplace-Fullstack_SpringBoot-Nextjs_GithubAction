"use client";

import React from "react";
import { AlertTriangle, Info } from "lucide-react";
import { QualityIssueSeverity } from "@/lib/productQualityCheck";

type FieldWarningProps = {
  children: React.ReactNode;
  severity?: QualityIssueSeverity;
  message?: string;
  field?: string;
};

const severityClasses: Record<QualityIssueSeverity, string> = {
  critical: "border-red-300 ring-red-100 bg-red-50/40",
  warning: "border-amber-300 ring-amber-100 bg-amber-50/40",
  info: "border-blue-300 ring-blue-100 bg-blue-50/40",
};

const iconClasses: Record<QualityIssueSeverity, string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  warning: "bg-amber-100 text-amber-700 border-amber-200",
  info: "bg-blue-100 text-blue-700 border-blue-200",
};

export default function FieldWarning({
  children,
  severity,
  message,
  field,
}: FieldWarningProps) {
  if (!severity) {
    return <div data-quality-field={field}>{children}</div>;
  }

  const Icon = severity === "info" ? Info : AlertTriangle;

  return (
    <div
      data-quality-field={field}
      className={`relative rounded-[24px] border-2 ring-4 ${severityClasses[severity]}`}
    >
      <div
        className={`absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border shadow-sm ${iconClasses[severity]}`}
        title={message}
      >
        <Icon size={16} />
      </div>
      {children}
    </div>
  );
}
