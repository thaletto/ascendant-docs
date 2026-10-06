import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { buildChartMarkdown, type ChartResult } from "@/lib/chart";

const MARGIN = 14;
const PAGE_WIDTH = 210;
const PAGE_BOTTOM = 278;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function splitRow(line: string): string[] {
  return line
    .split(/(?<!\\)\|/)
    .slice(1, -1)
    .map((cell) => cell.trim().replaceAll("\\|", "|"));
}

function isSeparatorRow(line: string): boolean {
  return /^\|[\s:|-]+\|$/.test(line.replaceAll(" ", ""));
}

function plain(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith("_") && trimmed.endsWith("_") && trimmed.length > 1) {
    return trimmed.slice(1, -1);
  }
  return text;
}

/** Renders the chart markdown (single source of truth) as a downloadable PDF. */
export function buildChartPdf(result: ChartResult): Blob {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let cursorY = 18;

  const ensureSpace = (needed: number) => {
    if (cursorY + needed > PAGE_BOTTOM) {
      doc.addPage();
      cursorY = 18;
    }
  };

  const heading = (text: string, level: number) => {
    cursorY += level === 1 ? 0 : 4;
    ensureSpace(14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(level === 1 ? 16 : level === 2 ? 12 : 10);
    doc.text(text, MARGIN, cursorY);
    cursorY += level === 1 ? 9 : 7;
  };

  const paragraph = (text: string, indent = 0) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const wrapped = doc.splitTextToSize(text, CONTENT_WIDTH - indent);
    ensureSpace(wrapped.length * 5 + 2);
    doc.text(wrapped, MARGIN + indent, cursorY);
    cursorY += wrapped.length * 5 + 1;
  };

  const table = (head: string[], body: string[][]) => {
    autoTable(doc, {
      startY: cursorY,
      head: [head],
      body,
      margin: { left: MARGIN, right: MARGIN },
      tableWidth: "wrap",
      styles: { fontSize: 7.5, cellPadding: 1.4, overflow: "linebreak" },
      headStyles: { fillColor: [64, 64, 64], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });
    const api = doc as unknown as {
      getLastAutoTable?: () => { finalY?: number } | null;
    };
    cursorY = (api.getLastAutoTable?.()?.finalY ?? cursorY) + 6;
  };

  const lines = buildChartMarkdown(result).split("\n");
  let index = 0;
  while (index < lines.length) {
    const line = lines[index].trimEnd();
    const trimmed = line.trim();

    if (trimmed === "") {
      index += 1;
      continue;
    }
    if (trimmed.startsWith("### ")) {
      heading(trimmed.slice(4), 3);
    } else if (trimmed.startsWith("## ")) {
      heading(trimmed.slice(3), 2);
    } else if (trimmed.startsWith("# ")) {
      heading(trimmed.slice(2), 1);
    } else if (trimmed.startsWith("|")) {
      const head = splitRow(trimmed);
      const body: string[][] = [];
      index += 1;
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        const rowLine = lines[index].trim();
        if (!isSeparatorRow(rowLine)) {
          body.push(splitRow(rowLine));
        }
        index += 1;
      }
      table(head, body);
      continue;
    } else if (/^(-|\*)\s+/.test(trimmed) || /^ {2}-\s+/.test(line)) {
      const nested = /^\s{2,}-/.test(line);
      const text = trimmed.replace(/^(-|\*)\s+/, "");
      paragraph(`\u2022  ${plain(text)}`, nested ? 10 : 4);
    } else {
      paragraph(plain(trimmed));
    }
    index += 1;
  }

  return doc.output("blob");
}
