import { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { jsPDF } from 'jspdf';
import { useRouter } from 'next/router';
import ShapeToolbar from '../components/ShapeToolbar';
import EditorSidebar from '../components/EditorSidebar';

const CanvasStage = dynamic(() => import('../components/CanvasStage'), {
  ssr: false,
});

function createShape(type, x, y, extra = {}) {
  const id = `shape-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const base = {
    id,
    type,
    x,
    y,
    stroke: '#111827',
    strokeWidth: 2,
    fill: '#ffffff',
  };

  if (type === 'circle') return { ...base, radius: 18 };
  if (type === 'rect') return { ...base, width: 120, height: 40 };
  if (type === 'omrRow') return { ...base, width: 160, height: 34, count: 4 };
  if (type === 'text') return { ...base, text: 'Label', fontSize: 16, fill: '#111827' };
  if (type === 'line') return { ...base, length: 160 };

  if (type === 'textbox') {
    return {
      ...base,
      width: 220,
      height: 90,
      strokeWidth: 1.5,
      fill: '#ffffff',
      text: 'Double-click to edit',
      fontSize: 16,
      textColor: '#111827',
    };
  }

  if (type === 'image') {
    return { ...base, src: extra.src || '' };
  }

  return base;
}

export default function DesignerPage() {
  const router = useRouter();
  const stageRef = useRef(null);

  const [shapes, setShapes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [jsonText, setJsonText] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showPdf, setShowPdf] = useState(false);
  const [isTemplateSaved, setIsTemplateSaved] = useState(false); // State to track if template is saved

  /* ================= TEMPLATE LOAD ================= */
  useEffect(() => {
    if (!router.isReady) return;

    const { templateId, new: isNew } = router.query;

    if (isNew) {
      setShapes([]);
      setSelectedId(null);
      return;
    }

    if (templateId) {
      const stored = JSON.parse(localStorage.getItem('omr-templates') || '[]');
      const found = stored.find((t) => t.id === templateId);
      if (found) {
        setShapes(found.shapes || []);
      }
    }
  }, [router.isReady, router.query]);

  /* ================= SAVE TEMPLATE ================= */
  const handleSaveTemplate = () => {
    if (isTemplateSaved) return; // Prevent saving again if already saved

    const name =
      prompt('Enter template name') || `Template ${new Date().toLocaleString()}`;

    const stored = JSON.parse(localStorage.getItem('omr-templates') || '[]');

    const template = {
      id: `tpl-${Date.now()}`,
      name,
      shapes,
      createdAt: new Date().toISOString(),
    };

    const updatedTemplates = [...stored, template];
    localStorage.setItem('omr-templates', JSON.stringify(updatedTemplates));

    alert('Template saved successfully');
    setIsTemplateSaved(true); // Mark template as saved
    return template; // Return the saved template to update local state
  };

  /* ================= ORIGINAL LOGIC (UNCHANGED) ================= */

  const handleDropNewShape = (type, x, y, extra) => {
    const newShape = createShape(type, x, y, extra);
    setShapes((prev) => [...prev, newShape]);
    setSelectedId(newShape.id);
  };

  const handleChangeShape = (id, newAttrs) => {
    setShapes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...newAttrs } : s)),
    );
  };

  const handleClearAll = () => {
    setShapes([]);
    setSelectedId(null);
  };

  const handleDeleteShape = (id) => {
    setShapes((prev) => prev.filter((s) => s.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleDuplicateShape = (id) => {
    const original = shapes.find((s) => s.id === id);
    if (!original) return;
    setShapes((prev) => [
      ...prev,
      {
        ...original,
        id: `shape-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        x: original.x + 20,
        y: original.y + 20,
      },
    ]);
  };

  const handleSendToBack = (id) => {
    setShapes((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx === -1) return prev;
      const arr = [...prev];
      const [item] = arr.splice(idx, 1);
      arr.unshift(item);
      return arr;
    });
  };

  const handleBringToFront = (id) => {
    setShapes((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx === -1) return prev;
      const arr = [...prev];
      const [item] = arr.splice(idx, 1);
      arr.push(item);
      return arr;
    });
  };

  const handleRefreshJson = () => {
    setJsonText(JSON.stringify(shapes, null, 2));
  };

  const handleLoadJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) return alert('JSON must be an array');
      setShapes(parsed);
      setSelectedId(parsed[0]?.id || null);
    } catch {
      alert('Invalid JSON');
    }
  };

  /* ================= AUTO-GENERATE OMR ROWS (RESTORED) ================= */
  const handleGenerateRows = (count) => {
    const maxRows = Math.min(count, 100);
    const startXNumber = 40;
    const startXRow = 90;
    const startY = 80;
    const rowGap = 32;

    const newShapes = [];

    for (let i = 0; i < maxRows; i += 1) {
      const y = startY + i * rowGap;

      newShapes.push(
        {
          id: `qnum-${i + 1}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          type: 'text',
          x: startXNumber,
          y,
          stroke: '#ffffff',
          strokeWidth: 0,
          fill: '#111827',
          text: String(i + 1),
          fontSize: 16,
        },
        {
          id: `qrow-${i + 1}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          type: 'omrRow',
          x: startXRow,
          y,
          stroke: '#111827',
          strokeWidth: 2,
          fill: '#ffffff',
          width: 160,
          height: 30,
          count: 4,
        },
      );
    }

    setShapes((prev) => [...prev, ...newShapes]);
  };

  /* ================= GROUPED OMR (RESTORED) ================= */
  const handleGenerateOmrGroup = ({
    startNumber = 1,
    endNumber = 30,
    rowsPerColumn = 10,
    bubbleCount = 4,
  }) => {
    const start = Number(startNumber) || 1;
    const end = Number(endNumber) || start;
    const totalQuestions = Math.max(0, end - start + 1);

    const newShape = {
      id: `omrGroup-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: 'omrGroup',
      x: 60,
      y: 80,
      stroke: '#111827',
      strokeWidth: 1.5,
      fill: '#ffffff',
      startNumber: start,
      totalQuestions,
      rowsPerColumn,
      bubbleCount,
      rowGap: 30,
      colGap: 180,
      numberOffsetX: 0,
      bubblesOffsetX: 30,
    };

    setShapes((prev) => [...prev, newShape]);
    setSelectedId(newShape.id);
  };

  const handleExportPdf = () => {
    if (!stageRef.current) return;
    const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const width = pdf.internal.pageSize.getWidth() - 40;
    const height = (stageRef.current.height() / stageRef.current.width()) * width;

    pdf.addImage(dataUrl, 'PNG', 20, 20, width, height);
    setPdfUrl(pdf.output('bloburl'));
    setShowPdf(true);
  };

  const selectedShape = shapes.find((s) => s.id === selectedId) || null;

  const handleGoToTemplates = async () => {
    const shouldSave = window.confirm('Do you want to save the current template before leaving?');
    if (shouldSave && !isTemplateSaved) {
      const savedTemplate = handleSaveTemplate(); // Save the template
      setShapes([...shapes, savedTemplate]); // Update the local state to prevent duplicates
    }
    router.push('/savedTemplate');
  };

  return (
    <>
      <div className="designer-page">
        <ShapeToolbar
          onClearAll={handleClearAll}
          onGenerateRows={handleGenerateRows}
          onGenerateOmrGroup={handleGenerateOmrGroup}
          onExportPdf={handleExportPdf}
        />

        <CanvasStage
          shapes={shapes}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          onChangeShape={handleChangeShape}
          onDropNewShape={handleDropNewShape}
          stageRef={stageRef}
        />

        <EditorSidebar
          selectedShape={selectedShape}
          onChangeShape={handleChangeShape}
          onDeleteShape={handleDeleteShape}
          onDuplicateShape={handleDuplicateShape}
          onSendToBack={handleSendToBack}
          onBringToFront={handleBringToFront}
          jsonText={jsonText}
          setJsonText={setJsonText}
          onRefreshJson={handleRefreshJson}
          onLoadJson={handleLoadJson}
        />
      </div>

      <div style={{ position: 'fixed', bottom: '20px', right: '20px' }}>
        <button
          onClick={handleSaveTemplate}
          style={{
            padding: '8px 14px',
            borderRadius: '6px',
            background: '#16a34a',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '10px',
          }}
        >
          Save Template
        </button>
        <button
          onClick={handleGoToTemplates}
          style={{
            padding: '8px 14px',
            borderRadius: '6px',
            background: '#4f46e5',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Go To Templates
        </button>
      </div>

      {showPdf && (
        <iframe
          src={pdfUrl}
          style={{ position: 'fixed', inset: 0, width: '100%', height: '100%' }}
        />
      )}
    </>
  );
}