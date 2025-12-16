export default function EditorSidebar({
  selectedShape,
  onChangeShape,
  onDeleteShape,
  onDuplicateShape,
  onSendToBack,
  onBringToFront,
  jsonText,
  setJsonText,
  onRefreshJson,
  onLoadJson,
}) {
  const handleNumberChange = (field, value) => {
    if (!selectedShape) return;
    const n = Number(value);
    if (!Number.isNaN(n)) {
      onChangeShape(selectedShape.id, { [field]: n });
    }
  };

  const handleTextChange = (field, value) => {
    if (!selectedShape) return;
    onChangeShape(selectedShape.id, { [field]: value });
  };

  const handleColorChange = (field, value) => {
    if (!selectedShape) return;
    onChangeShape(selectedShape.id, { [field]: value });
  };

  const handleImageReplace = (e) => {
    if (!selectedShape) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onChangeShape(selectedShape.id, { src: reader.result });
    };
    reader.readAsDataURL(file);
  };

  if (!selectedShape) {
    return (
      <aside className="sidebar">
        <h2 className="sidebar-title">Inspector</h2>
        <p className="sidebar-text">
          Select a shape on the canvas to adjust its properties.
        </p>

        <section className="sidebar-section">
          <h3>Template JSON</h3>
          <div className="sidebar-actions">
            <button className="toolbar-btn" type="button" onClick={onRefreshJson}>
              Refresh JSON
            </button>
            <button
              className="toolbar-btn toolbar-btn-secondary"
              type="button"
              onClick={onLoadJson}
            >
              Load JSON
            </button>
          </div>
          <textarea
            className="json-area"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder="JSON layout appears here..."
          />
        </section>
      </aside>
    );
  }

  const type = selectedShape.type;
  const isCircle = type === 'circle';
  const isRect = type === 'rect';
  const isText = type === 'text';
  const isLine = type === 'line';
  const isOmrRow = type === 'omrRow';
  const isOmrGroup = type === 'omrGroup';
  const isImage = type === 'image';
  const isTextbox = type === 'textbox';
  const isTable = type === 'table';

  let omrOptionsPreview = '';
  if (isOmrRow) {
    const count = Math.max(1, Math.min(26, selectedShape.count || 4));
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, count);
    omrOptionsPreview = alphabet.split('').join('');
  }

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Inspector</h2>
      <p className="sidebar-text">Modify settings of the selected shape.</p>

      <section className="sidebar-section">
        <h3>Selected shape</h3>
        <p className="sidebar-label">
          Type: <strong>{type}</strong>
        </p>

        {/* X / Y */}
        <div className="sidebar-grid">
          <label>
            X
            <input
              type="number"
              value={selectedShape.x}
              onChange={(e) => handleNumberChange('x', e.target.value)}
            />
          </label>
          <label>
            Y
            <input
              type="number"
              value={selectedShape.y}
              onChange={(e) => handleNumberChange('y', e.target.value)}
            />
          </label>
        </div>

        {/* Width / height */}
        {(isRect || isTextbox || isOmrRow) && (
          <div className="sidebar-grid">
            <label>
              Width
              <input
                type="number"
                value={selectedShape.width || ''}
                onChange={(e) => handleNumberChange('width', e.target.value)}
              />
            </label>
            <label>
              Height
              <input
                type="number"
                value={selectedShape.height || ''}
                onChange={(e) => handleNumberChange('height', e.target.value)}
              />
            </label>
          </div>
        )}

        {/* Circle */}
        {isCircle && (
          <label className="sidebar-single">
            Radius
            <input
              type="number"
              value={selectedShape.radius}
              onChange={(e) => handleNumberChange('radius', e.target.value)}
            />
          </label>
        )}

        {/* Line */}
        {isLine && (
          <label className="sidebar-single">
            Length
            <input
              type="number"
              value={selectedShape.length}
              onChange={(e) => handleNumberChange('length', e.target.value)}
            />
          </label>
        )}

        {/* Text */}
        {isText && (
          <>
            <label className="sidebar-single">
              Text
              <input
                type="text"
                value={selectedShape.text}
                onChange={(e) => handleTextChange('text', e.target.value)}
              />
            </label>
            <label className="sidebar-single">
              Font size
              <input
                type="number"
                value={selectedShape.fontSize}
                onChange={(e) => handleNumberChange('fontSize', e.target.value)}
              />
            </label>
            <label className="sidebar-single">
              Color
              <input
                type="color"
                value={selectedShape.fill || '#111827'}
                onChange={(e) => handleColorChange('fill', e.target.value)}
              />
            </label>
          </>
        )}

        {/* Textbox (UPDATED: add Text field) */}
        {isTextbox && (
          <>
            <label className="sidebar-single">
              Text
              <input
                type="text"
                value={selectedShape.text || ''}
                onChange={(e) => handleTextChange('text', e.target.value)}
              />
            </label>

            <label className="sidebar-single">
              Font size
              <input
                type="number"
                value={selectedShape.fontSize}
                onChange={(e) => handleNumberChange('fontSize', e.target.value)}
              />
            </label>

            <label className="sidebar-single">
              Text color
              <input
                type="color"
                value={selectedShape.textColor || '#111827'}
                onChange={(e) => handleColorChange('textColor', e.target.value)}
              />
            </label>

            <label className="sidebar-single">
              Fill color
              <input
                type="color"
                value={selectedShape.fill || '#ffffff'}
                onChange={(e) => handleColorChange('fill', e.target.value)}
              />
            </label>

            <label className="sidebar-single">
              Border color
              <input
                type="color"
                value={selectedShape.stroke || '#111827'}
                onChange={(e) => handleColorChange('stroke', e.target.value)}
              />
            </label>
          </>
        )}

        {/* Table */}
        {isTable && (
          <>
            <div className="sidebar-grid">
              <label>
                Rows
                <input
                  type="number"
                  min="1"
                  value={selectedShape.rows}
                  onChange={(e) => handleNumberChange('rows', e.target.value)}
                />
              </label>
              <label>
                Columns
                <input
                  type="number"
                  min="1"
                  value={selectedShape.cols}
                  onChange={(e) => handleNumberChange('cols', e.target.value)}
                />
              </label>
            </div>

            <div className="sidebar-grid">
              <label>
                Cell width
                <input
                  type="number"
                  value={selectedShape.cellWidth}
                  onChange={(e) => handleNumberChange('cellWidth', e.target.value)}
                />
              </label>
              <label>
                Cell height
                <input
                  type="number"
                  value={selectedShape.cellHeight}
                  onChange={(e) => handleNumberChange('cellHeight', e.target.value)}
                />
              </label>
            </div>

            <label className="sidebar-single">
              Border color
              <input
                type="color"
                value={selectedShape.stroke}
                onChange={(e) => handleColorChange('stroke', e.target.value)}
              />
            </label>

            <label className="sidebar-single">
              Border width
              <input
                type="number"
                min="1"
                max="5"
                value={selectedShape.strokeWidth}
                onChange={(e) => handleNumberChange('strokeWidth', e.target.value)}
              />
            </label>
          </>
        )}

        {/* Image controls */}
        {isImage && (
          <>
            <div className="sidebar-grid">
              <label>
                Width
                <input
                  type="number"
                  value={selectedShape.width || ''}
                  onChange={(e) => handleNumberChange('width', e.target.value)}
                />
              </label>
              <label>
                Height
                <input
                  type="number"
                  value={selectedShape.height || ''}
                  onChange={(e) => handleNumberChange('height', e.target.value)}
                />
              </label>
            </div>

            <label className="sidebar-single">
              Replace image
              <input type="file" accept="image/*" onChange={handleImageReplace} />
            </label>
          </>
        )}

        {/* OMR row */}
        {isOmrRow && (
          <>
            <label className="sidebar-single">
              Bubble count
              <input
                type="number"
                min={1}
                max={10}
                value={selectedShape.count || 4}
                onChange={(e) => handleNumberChange('count', e.target.value)}
              />
            </label>
            <p className="sidebar-label">
              Options:&nbsp;
              <strong>{omrOptionsPreview}</strong>
            </p>
          </>
        )}

        {/* OMR group */}
        {isOmrGroup && (
          <>
            <label className="sidebar-single">
              Start number
              <input
                type="number"
                value={selectedShape.startNumber}
                onChange={(e) => handleNumberChange('startNumber', e.target.value)}
              />
            </label>
            <label className="sidebar-single">
              Total questions
              <input
                type="number"
                value={selectedShape.totalQuestions}
                onChange={(e) => handleNumberChange('totalQuestions', e.target.value)}
              />
            </label>
            <label className="sidebar-single">
              Rows per column
              <input
                type="number"
                value={selectedShape.rowsPerColumn}
                onChange={(e) => handleNumberChange('rowsPerColumn', e.target.value)}
              />
            </label>
            <label className="sidebar-single">
              Options per question
              <input
                type="number"
                value={selectedShape.bubbleCount}
                onChange={(e) => handleNumberChange('bubbleCount', e.target.value)}
              />
            </label>
            <label className="sidebar-single">
              Row gap
              <input
                type="number"
                value={selectedShape.rowGap}
                onChange={(e) => handleNumberChange('rowGap', e.target.value)}
              />
            </label>
            <label className="sidebar-single">
              Column gap
              <input
                type="number"
                value={selectedShape.colGap}
                onChange={(e) => handleNumberChange('colGap', e.target.value)}
              />
            </label>
          </>
        )}

        {/* Universal fill */}
        {(isCircle || isRect || isOmrRow || isTable || isTextbox) && (
          <label className="sidebar-single">
            Fill color
            <input
              type="color"
              value={selectedShape.fill || '#ffffff'}
              onChange={(e) => handleColorChange('fill', e.target.value)}
            />
          </label>
        )}

        {/* Universal stroke */}
        {(isCircle ||
          isRect ||
          isOmrRow ||
          isLine ||
          isOmrGroup ||
          isTable ||
          isTextbox) && (
            <label className="sidebar-single">
              Stroke color
              <input
                type="color"
                value={selectedShape.stroke || '#111827'}
                onChange={(e) => handleColorChange('stroke', e.target.value)}
              />
            </label>
          )}

        <div className="sidebar-actions">
          <button
            className="toolbar-btn"
            type="button"
            onClick={() => onDuplicateShape(selectedShape.id)}
          >
            Duplicate
          </button>
          <button
            className="toolbar-btn toolbar-btn-secondary"
            type="button"
            onClick={() => onDeleteShape(selectedShape.id)}
          >
            Delete
          </button>
        </div>

        <div className="sidebar-actions">
          <button
            className="toolbar-btn"
            type="button"
            onClick={() => onBringToFront(selectedShape.id)}
          >
            Bring to front
          </button>
          <button
            className="toolbar-btn toolbar-btn-secondary"
            type="button"
            onClick={() => onSendToBack(selectedShape.id)}
          >
            Send to back
          </button>
        </div>
      </section>

      {/* JSON section */}
      <section className="sidebar-section">
        <h3>Template JSON</h3>
        <div className="sidebar-actions">
          <button className="toolbar-btn" type="button" onClick={onRefreshJson}>
            Refresh JSON
          </button>
          <button
            className="toolbar-btn toolbar-btn-secondary"
            type="button"
            onClick={onLoadJson}
          >
            Load JSON
          </button>
        </div>
        <textarea
          className="json-area"
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
        />
      </section>
    </aside>
  );
}