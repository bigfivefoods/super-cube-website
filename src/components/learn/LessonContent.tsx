import type { ReactNode } from "react";
import {
  BLOCK_META,
  type SessionSection,
} from "@/lib/lms/curriculum";

function renderInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function renderBody(md: string) {
  const lines = md.split("\n");
  const nodes: ReactNode[] = [];
  let listBuffer: { ordered: boolean; items: string[] } | null = null;

  function flushList(keyBase: number) {
    if (!listBuffer || listBuffer.items.length === 0) return;
    const Tag = listBuffer.ordered ? "ol" : "ul";
    nodes.push(
      <Tag
        key={`list-${keyBase}`}
        className={`my-3 space-y-1.5 pl-5 text-[0.95rem] leading-relaxed text-slate ${
          listBuffer.ordered ? "list-decimal" : "list-disc"
        }`}
      >
        {listBuffer.items.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </Tag>
    );
    listBuffer = null;
  }

  lines.forEach((line, i) => {
    const ordered = /^\d+\.\s/.test(line);
    const bullet = line.startsWith("- ") || line.startsWith("- [ ] ");

    if (ordered || bullet) {
      const item = line
        .replace(/^- \[ \] /, "")
        .replace(/^- /, "")
        .replace(/^\d+\.\s/, "");
      if (!listBuffer || listBuffer.ordered !== ordered) {
        flushList(i);
        listBuffer = { ordered, items: [] };
      }
      listBuffer.items.push(item);
      return;
    }

    flushList(i);

    if (line.startsWith("### ")) {
      nodes.push(
        <h4
          key={i}
          className="mt-5 text-sm font-semibold tracking-tight text-ink first:mt-0"
        >
          {line.replace(/^### /, "")}
        </h4>
      );
      return;
    }
    if (line.startsWith("## ")) {
      nodes.push(
        <h3
          key={i}
          className="mt-6 text-lg font-semibold tracking-tight text-ink first:mt-0"
        >
          {line.replace(/^## /, "")}
        </h3>
      );
      return;
    }
    if (!line.trim()) {
      nodes.push(<div key={i} className="h-2" />);
      return;
    }
    nodes.push(
      <p key={i} className="text-[0.95rem] leading-relaxed text-slate">
        {renderInline(line)}
      </p>
    );
  });

  flushList(lines.length);
  return nodes;
}

export function LessonContent({
  sections,
  color,
  colorSoft,
}: {
  sections: SessionSection[];
  color: string;
  colorSoft: string;
}) {
  return (
    <div className="space-y-5">
      {sections.map((section) => {
        const meta = BLOCK_META[section.block];
        return (
          <section
            key={`${section.block}-${section.title}`}
            className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-[0_1px_0_rgba(0,0,0,0.03)]"
          >
            <header
              className="flex items-center gap-3 border-b border-black/[0.05] px-4 py-3 sm:px-6"
              style={{ background: colorSoft }}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                style={{ background: color }}
              >
                {meta.label.slice(0, 1)}
              </span>
              <div className="min-w-0">
                <p
                  className="text-[0.65rem] font-semibold uppercase tracking-[0.14em]"
                  style={{ color }}
                >
                  {meta.label} · {meta.hint}
                </p>
                <h2 className="truncate text-base font-semibold tracking-tight text-ink sm:text-lg">
                  {section.title.replace(/^(Read|Engage|Apply)\s*·\s*/i, "")}
                </h2>
              </div>
            </header>
            <div className="space-y-1 px-4 py-5 sm:px-6 sm:py-6">
              {renderBody(section.body)}
            </div>
          </section>
        );
      })}
    </div>
  );
}
