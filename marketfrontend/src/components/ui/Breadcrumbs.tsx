"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  const router = useRouter();

  return (
    <nav className="flex items-center gap-2 text-sm">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight size={14} className="text-slate-400" />}
          {item.path ? (
            <button
              onClick={() => router.push(item.path!)}
              className="text-slate-500 hover:text-blue-600 font-medium transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-slate-800 font-bold">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
