import { useState } from 'react';

// Individual draggable item (supports extra drag data)
function DraggableItem({ type, label, icon, dragData }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('shape-type', type);

    if (dragData && typeof dragData === 'object') {
      Object.entries(dragData).forEach(([k, v]) => {
        if (typeof v === 'string') e.dataTransfer.setData(k, v);
      });
    }
  };

  return (
    <div
      className="toolbar-draggable"
      draggable
      onDragStart={handleDragStart}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0.55rem 0.6rem',
      }}
    >
      {icon}
      <span style={{ fontSize: '0.85rem', color: '#374151' }}>{label}</span>
    </div>
  );
}

export default function ShapeToolbar({
  onClearAll,
  onGenerateRows,
  onGenerateOmrGroup,
  onExportPdf,
}) {
  const [rowsCount, setRowsCount] = useState(20);

  // grouped generator state (now uses start/end)
  const [groupStartNumber, setGroupStartNumber] = useState(1);
  const [groupEndNumber, setGroupEndNumber] = useState(30);
  const [groupRowsPerColumn, setGroupRowsPerColumn] = useState(10);
  const [groupBubbleCount, setGroupBubbleCount] = useState(4);

  // uploaded images list for dragging onto canvas
  const [images, setImages] = useState([]); // [{ id, name, src }]

  const readFileAsDataURL = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleAddImages = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      const results = await Promise.all(
        files.map(async (file) => {
          const src = await readFileAsDataURL(file);
          return {
            id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: file.name,
            src,
          };
        }),
      );

      setImages((prev) => [...results, ...prev]);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      // eslint-disable-next-line no-alert
      alert('Failed to read one of the images. Please try again.');
    } finally {
      // allow re-uploading same file
      // eslint-disable-next-line no-param-reassign
      e.target.value = '';
    }
  };

  //
  // VISIO-STYLE ICONS
  //
  const iconCircle = (
    <svg width="22" height="22">
      <circle cx="11" cy="11" r="9" stroke="#1e293b" strokeWidth="2" fill="none" />
    </svg>
  );

  const iconRect = (
    <svg width="28" height="20">
      <rect x="2" y="2" width="24" height="16" stroke="#1e293b" strokeWidth="2" fill="none" />
    </svg>
  );

  const iconText = (
    <svg width="22" height="22">
      <text
        x="50%"
        y="60%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="16"
        fontFamily="Arial"
        fill="#1e293b"
      >
        A
      </text>
    </svg>
  );

  const iconTextbox = (
    <svg width="28" height="20">
      <rect x="2" y="2" width="24" height="16" stroke="#1e293b" strokeWidth="2" fill="none" />
      <line x1="6" y1="7" x2="22" y2="7" stroke="#1e293b" strokeWidth="2" />
      <line x1="6" y1="12" x2="18" y2="12" stroke="#1e293b" strokeWidth="2" />
    </svg>
  );

  const iconLine = (
    <svg width="28" height="10">
      <line x1="2" y1="5" x2="26" y2="5" stroke="#1e293b" strokeWidth="2" />
    </svg>
  );

  const handleGenerateRowsClick = () => {
    onGenerateRows(rowsCount);
  };

  const handleGenerateGroupClick = () => {
    if (!onGenerateOmrGroup) return;

    const start = Number(groupStartNumber) || 1;
    const end = Number(groupEndNumber) || start;
    if (end < start) {
      // eslint-disable-next-line no-alert
      alert('End number must be >= start number.');
      return;
    }

    onGenerateOmrGroup({
      startNumber: start,
      endNumber: end,
      rowsPerColumn: Number(groupRowsPerColumn) || 10,
      bubbleCount: Number(groupBubbleCount) || 4,
    });
  };

  return (
    <aside className="toolbar">
      <h2 className="toolbar-title">Shapes</h2>
      <p className="toolbar-text">
        Drag a shape from here onto the canvas, move them around,
        and edit their properties on the right. Export and import layouts as JSON.
      </p>

      <div className="toolbar-section">
        <h3>Basic</h3>
        <DraggableItem type="circle" label="circle" icon={iconCircle} />
        <DraggableItem type="rect" label="rect" icon={iconRect} />
        <DraggableItem type="text" label="text" icon={iconText} />
        <DraggableItem type="textbox" label="textbox" icon={iconTextbox} />
        <DraggableItem type="line" label="line" icon={iconLine} />
      </div>

      {/* Images uploader + draggable thumbnails */}
      <div className="toolbar-section">
        <h3>Images</h3>
        <p className="toolbar-text">Upload an image, then drag it onto the canvas.</p>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleAddImages}
          style={{
            width: '100%',
            margin: '0.25rem 0 0.5rem',
            fontSize: '0.8rem',
          }}
        />

        {images.length === 0 ? (
          <p className="toolbar-text" style={{ marginTop: 0 }}>
            No images uploaded yet.
          </p>
        ) : (
          images.map((img) => (
            <DraggableItem
              key={img.id}
              type="image"
              label={img.name}
              dragData={{ 'image-src': img.src }}
              icon={
                <img
                  src={img.src}
                  alt={img.name}
                  style={{
                    width: 28,
                    height: 28,
                    objectFit: 'cover',
                    borderRadius: 6,
                    border: '1px solid #cbd5f5',
                  }}
                />
              }
            />
          ))
        )}
      </div>

      <div className="toolbar-section">
        <h3>Auto-generate questions</h3>
        <p className="toolbar-text">Create quick numbered OMR rows in one column.</p>
        <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
          Number of rows
          <select
            value={rowsCount}
            onChange={(e) => setRowsCount(Number(e.target.value))}
            style={{
              width: '100%',
              marginTop: '0.25rem',
              padding: '0.35rem 0.4rem',
              borderRadius: '0.45rem',
              border: '1px solid #d1d5db',
              fontSize: '0.8rem',
            }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>
        <button className="toolbar-btn" type="button" onClick={handleGenerateRowsClick}>
          Generate rows 1–{rowsCount}
        </button>
      </div>

      <div className="toolbar-section">
        <h3>Grouped OMR sheet</h3>
        <p className="toolbar-text">Generate a moveable group of questions arranged in columns.</p>

        <label className="sidebar-single" style={{ fontSize: '0.8rem' }}>
          Start number
          <input
            type="number"
            min={1}
            value={groupStartNumber}
            onChange={(e) => setGroupStartNumber(Number(e.target.value))}
            style={{
              width: '100%',
              marginTop: '0.25rem',
              padding: '0.3rem 0.4rem',
              borderRadius: '0.45rem',
              border: '1px solid #d1d5db',
              fontSize: '0.8rem',
            }}
          />
        </label>

        <label className="sidebar-single" style={{ fontSize: '0.8rem' }}>
          End number
          <input
            type="number"
            min={groupStartNumber || 1}
            value={groupEndNumber}
            onChange={(e) => setGroupEndNumber(Number(e.target.value))}
            style={{
              width: '100%',
              marginTop: '0.25rem',
              padding: '0.3rem 0.4rem',
              borderRadius: '0.45rem',
              border: '1px solid #d1d5db',
              fontSize: '0.8rem',
            }}
          />
        </label>

        <label className="sidebar-single" style={{ fontSize: '0.8rem' }}>
          Rows per column
          <input
            type="number"
            min={1}
            max={50}
            value={groupRowsPerColumn}
            onChange={(e) => setGroupRowsPerColumn(Number(e.target.value))}
            style={{
              width: '100%',
              marginTop: '0.25rem',
              padding: '0.3rem 0.4rem',
              borderRadius: '0.45rem',
              border: '1px solid #d1d5db',
              fontSize: '0.8rem',
            }}
          />
        </label>

        <label className="sidebar-single" style={{ fontSize: '0.8rem' }}>
          Options per question (A–…)
          <input
            type="number"
            min={1}
            max={10}
            value={groupBubbleCount}
            onChange={(e) => setGroupBubbleCount(Number(e.target.value))}
            style={{
              width: '100%',
              marginTop: '0.25rem',
              padding: '0.3rem 0.4rem',
              borderRadius: '0.45rem',
              border: '1px solid #d1d5db',
              fontSize: '0.8rem',
            }}
          />
        </label>

        <button className="toolbar-btn" type="button" onClick={handleGenerateGroupClick}>
          Generate grouped sheet
        </button>
      </div>

      <div className="toolbar-section">
        <h3>Layout</h3>
        <button
          className="toolbar-btn toolbar-btn-secondary"
          type="button"
          onClick={onClearAll}
        >
          Clear all shapes
        </button>
        <button className="toolbar-btn" type="button" onClick={onExportPdf}>
          Preview / Export PDF (A4)
        </button>
      </div>

      <p className="toolbar-footnote">
        Tip: Double-click a textbox on the canvas to edit its text.
      </p>
    </aside>
  );
}