"use client";

import { ChevronRight } from "lucide-react";

interface BreadcrumbProps {
  items: string[];
  onItemClick?: (index: number) => void;
}

export default function Breadcrumb({ items, onItemClick }: BreadcrumbProps) {
  return (
    <nav className="w-full max-w-5xl mx-auto px-4 py-4 mt-6">
      <ol className="flex flex-wrap items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mx-1 sm:mx-2 shrink-0" />
            )}
            {index === items.length - 1 ? (
              <span className="text-indigo-600 font-semibold">{item}</span>
            ) : (
              <button
                onClick={() => onItemClick?.(index)}
                className="text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                {item}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
