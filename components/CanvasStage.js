import { useRef, useState, useEffect } from 'react';
import {
  Stage,
  Layer,
  Rect,
  Circle,
  Group,
  Text,
  Line,
  Image as KonvaImage,
} from 'react-konva';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 1120;
const HANDLE_SIZE = 8;

// Helper component for rendering image shapes
function CanvasImageShape({ shape, setSelectedId, onChangeShape, handleDragEnd }) {
  const [imageObj, setImageObj] = useState(null);

  useEffect(() => {
    if (!shape.src) return;
    const img = new window.Image();
    img.src = shape.src;
    img.onload = () => {
      setImageObj(img);

      // if width/height missing, initialize based on image
      if (!shape.width || !shape.height) {
        const maxWidth = 200;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const width = img.width * scale;
        const height = img.height * scale;
        onChangeShape(shape.id, { width, height });
      }
    };
  }, [shape.src]);

  if (!imageObj) return null;

  return (
    <KonvaImage
      x={shape.x}
      y={shape.y}
      width={shape.width}
      height={shape.height}
      image={imageObj}
      draggable
      onClick={() => setSelectedId(shape.id)}
      onTap={() => setSelectedId(shape.id)}
      onDragEnd={(e) => handleDragEnd(shape, e)}
    />
  );
}

export default function CanvasStage({
  shapes,
  selectedId,
  setSelectedId,
  onChangeShape,
  onDropNewShape,
  stageRef,
}) {
  const containerRef = useRef(null);

  // Inline textbox editing state
  const [editing, setEditing] = useState(null); // {id, text, x, y, width, height, fontSize}

  const handleStageMouseDown = (e) => {
    // clicked on empty area - clear selection (unless we are editing)
    if (editing) return;
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
    }
  };

  const handleDragEnd = (shape, e) => {
    const node = e.target;
    const newX = node.x();
    const newY = node.y();
    onChangeShape(shape.id, { x: newX, y: newY });
  };

  const handleDrop = (e) => {
    e.preventDefault();

    const type = e.dataTransfer.getData('shape-type');
    if (!type) return;

    // Use stage container rect (so drop position is correct even when centered)
    const stageContainer = stageRef.current?.container?.();
    const stageRect = stageContainer?.getBoundingClientRect?.();
    const fallbackRect = containerRef.current?.getBoundingClientRect?.();

    const rect = stageRect || fallbackRect;
    if (!rect) return;

    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // clamp inside stage bounds
    x = Math.max(0, Math.min(CANVAS_WIDTH, x));
    y = Math.max(0, Math.min(CANVAS_HEIGHT, y));

    if (type === 'image') {
      const src = e.dataTransfer.getData('image-src');
      if (!src) return;
      onDropNewShape(type, x, y, { src });
      return;
    }

    onDropNewShape(type, x, y);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  /** ---------- INLINE EDITING FOR TEXTBOX ---------- */

  const startEditingTextbox = (shape) => {
    if (!containerRef.current || !stageRef.current) return;

    const wrapperRect = containerRef.current.getBoundingClientRect();
    const stageContainer = stageRef.current.container();
    const stageRect = stageContainer.getBoundingClientRect();

    // offset of stage inside wrapper (because it's centered)
    const offsetX = stageRect.left - wrapperRect.left;
    const offsetY = stageRect.top - wrapperRect.top;

    setEditing({
      id: shape.id,
      text: shape.text || '',
      x: offsetX + shape.x,
      y: offsetY + shape.y,
      width: shape.width || 200,
      height: shape.height || 80,
      fontSize: shape.fontSize || 16,
    });
  };

  const finishEditingTextbox = () => {
    if (!editing) return;
    onChangeShape(editing.id, { text: editing.text });
    setEditing(null);
  };

  /** ---------- SHAPE RENDERING ---------- */

  const renderShape = (shape, isSelected) => {
    // common styling for basic shapes
    const commonProps = {
      key: shape.id,
      id: shape.id,
      x: shape.x,
      y: shape.y,
      stroke: isSelected ? '#2563eb' : shape.stroke,
      strokeWidth: shape.strokeWidth,
      fill: shape.fill,
      draggable: true,
      onClick: () => setSelectedId(shape.id),
      onTap: () => setSelectedId(shape.id),
      onDragEnd: (e) => handleDragEnd(shape, e),
    };

    if (shape.type === 'circle') {
      return <Circle {...commonProps} radius={shape.radius} />;
    }

    if (shape.type === 'rect') {
      return (
        <Rect
          {...commonProps}
          width={shape.width}
          height={shape.height}
          cornerRadius={4}
        />
      );
    }

    if (shape.type === 'omrRow') {
      const count = shape.count || 4;
      const width = shape.width || 160;
      const height = shape.height || 34;

      const bubbleRadius = Math.min(12, height / 2 - 4);
      const marginX = 20;
      const availableWidth = Math.max(0, width - marginX * 2);
      const spacing = count > 1 ? availableWidth / (count - 1) : 0;

      const bubbles = [];
      const labels = [];

      for (let i = 0; i < count; i += 1) {
        const cx = marginX + i * spacing;
        const cy = height / 2;

        const letterIndex = i % 26;
        const letter = String.fromCharCode(65 + letterIndex);

        bubbles.push(
          <Circle
            key={`${shape.id}-bubble-${i}`}
            x={cx}
            y={cy}
            radius={bubbleRadius}
            stroke={commonProps.stroke}
            strokeWidth={commonProps.strokeWidth}
            fill={shape.fill}
          />,
        );

        labels.push(
          <Text
            key={`${shape.id}-label-${i}`}
            x={cx - bubbleRadius}
            y={cy - bubbleRadius}
            width={bubbleRadius * 2}
            height={bubbleRadius * 2}
            text={letter}
            fontSize={bubbleRadius}
            fill="#111827"
            align="center"
            verticalAlign="middle"
          />,
        );
      }

      return (
        <Group {...commonProps} width={width} height={height}>
          {bubbles}
          {labels}
        </Group>
      );
    }

    if (shape.type === 'text') {
      return (
        <Text
          {...commonProps}
          text={shape.text}
          fontSize={shape.fontSize}
          fill={shape.fill || '#111827'}
          strokeWidth={0}
          draggable
        />
      );
    }

    if (shape.type === 'line') {
      return (
        <Line
          {...commonProps}
          points={[0, 0, shape.length, 0]}
          fillEnabled={false}
        />
      );
    }

    // -------- IMAGE SHAPE --------
    if (shape.type === 'image') {
      return (
        <CanvasImageShape
          key={shape.id}
          shape={shape}
          setSelectedId={setSelectedId}
          onChangeShape={onChangeShape}
          handleDragEnd={handleDragEnd}
        />
      );
    }

    // -------- TEXTBOX SHAPE (INLINE EDITABLE) --------
    if (shape.type === 'textbox') {
      const width = shape.width || 200;
      const height = shape.height || 80;
      const fontSize = shape.fontSize || 16;

      const strokeColor = isSelected ? '#2563eb' : (shape.stroke || '#111827');
      const strokeWidth = shape.strokeWidth ?? 1.5;

      return (
        <Group
          key={shape.id}
          x={shape.x}
          y={shape.y}
          draggable
          onClick={() => setSelectedId(shape.id)}
          onTap={() => setSelectedId(shape.id)}
          onDragEnd={(e) => handleDragEnd(shape, e)}
          onDblClick={() => startEditingTextbox(shape)}
          onDblTap={() => startEditingTextbox(shape)}
        >
          <Rect
            width={width}
            height={height}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill={shape.fill ?? '#ffffff'}
            cornerRadius={4}
          />
          {editing?.id !== shape.id && (
            <Text
              x={6}
              y={6}
              width={width - 12}
              height={height - 12}
              text={shape.text || ''}
              fontSize={fontSize}
              fill={shape.textColor || '#111827'}
              align="left"
              verticalAlign="top"
              wrap="word"
            />
          )}
        </Group>
      );
    }

    // -------- TABLE SHAPE (SIMPLE GRID) --------
    if (shape.type === 'table') {
      const rows = shape.rows || 2;
      const cols = shape.cols || 2;
      const cellWidth = shape.cellWidth || 40;
      const cellHeight = shape.cellHeight || 24;
      const width = cols * cellWidth;
      const height = rows * cellHeight;
      const stroke = isSelected ? '#2563eb' : (shape.stroke || '#111827');
      const strokeWidth = shape.strokeWidth || 1;

      return (
        <Group
          key={shape.id}
          x={shape.x}
          y={shape.y}
          draggable
          onClick={() => setSelectedId(shape.id)}
          onTap={() => setSelectedId(shape.id)}
          onDragEnd={(e) => handleDragEnd(shape, e)}
        >
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            stroke={stroke}
            strokeWidth={strokeWidth}
            fillEnabled={false}
          />
          {Array.from({ length: cols - 1 }).map((_, c) => {
            const x = (c + 1) * cellWidth;
            return (
              <Line
                key={`${shape.id}-v-${c}`}
                points={[x, 0, x, height]}
                stroke={stroke}
                strokeWidth={strokeWidth}
              />
            );
          })}
          {Array.from({ length: rows - 1 }).map((_, r) => {
            const y = (r + 1) * cellHeight;
            return (
              <Line
                key={`${shape.id}-h-${r}`}
                points={[0, y, width, y]}
                stroke={stroke}
                strokeWidth={strokeWidth}
              />
            );
          })}
        </Group>
      );
    }

    // -------- GROUPED OMR SHEET (MULTI-COLUMN WITH rowsPerColumn) --------
    if (shape.type === 'omrGroup') {
      const {
        totalQuestions = 30,
        rowsPerColumn = 10,
        bubbleCount = 4,
        rowGap = 30,
        colGap = 180,
        numberOffsetX = 0,
        bubblesOffsetX = 30,
        startNumber = 1,
      } = shape;

      const stroke = isSelected ? '#2563eb' : (shape.stroke || '#111827');
      const strokeWidth = shape.strokeWidth || 1.5;
      const fill = shape.fill || '#ffffff';

      const children = [];
      const bubbleRadius = 8;
      const bubbleSpacing = bubbleRadius * 2 + 4;

      for (let i = 0; i < totalQuestions; i += 1) {
        const qNumber = startNumber + i;

        const colIndex = Math.floor(i / rowsPerColumn);
        const rowIndex = i % rowsPerColumn;

        const baseX = colIndex * colGap;
        const baseY = rowIndex * rowGap;

        children.push(
          <Text
            key={`${shape.id}-gnum-${i}`}
            x={baseX + numberOffsetX}
            y={baseY}
            text={`${qNumber}.`}
            fontSize={14}
            fill="#111827"
          />,
        );

        for (let j = 0; j < bubbleCount; j += 1) {
          const cx = baseX + bubblesOffsetX + j * bubbleSpacing + bubbleRadius;
          const cy = baseY + 10;

          const letterIndex = j % 26;
          const letter = String.fromCharCode(65 + letterIndex);

          children.push(
            <Circle
              key={`${shape.id}-gbubble-${i}-${j}`}
              x={cx}
              y={cy}
              radius={bubbleRadius}
              stroke={stroke}
              strokeWidth={strokeWidth}
              fill={fill}
            />,
          );

          children.push(
            <Text
              key={`${shape.id}-glabel-${i}-${j}`}
              x={cx - bubbleRadius}
              y={cy - bubbleRadius}
              width={bubbleRadius * 2}
              height={bubbleRadius * 2}
              text={letter}
              fontSize={bubbleRadius}
              fill="#111827"
              align="center"
              verticalAlign="middle"
            />,
          );
        }
      }

      return (
        <Group
          key={shape.id}
          id={shape.id}
          x={shape.x}
          y={shape.y}
          draggable
          onClick={() => setSelectedId(shape.id)}
          onTap={() => setSelectedId(shape.id)}
          onDragEnd={(e) => handleDragEnd(shape, e)}
        >
          {children}
        </Group>
      );
    }

    return null;
  };

  /** ---------- RESIZE HANDLES ---------- */

  const renderResizeHandles = (shape) => {
    const handles = [];

    if (shape.type === 'circle') {
      const hx = shape.x + shape.radius;
      const hy = shape.y;

      handles.push(
        <Rect
          key={`${shape.id}-handle-circle`}
          x={hx - HANDLE_SIZE / 2}
          y={hy - HANDLE_SIZE / 2}
          width={HANDLE_SIZE}
          height={HANDLE_SIZE}
          fill="#ffffff"
          stroke="#2563eb"
          strokeWidth={1}
          draggable
          onDragMove={(e) => {
            const newRadius = Math.max(
              5,
              Math.abs(e.target.x() + HANDLE_SIZE / 2 - shape.x),
            );
            onChangeShape(shape.id, { radius: newRadius });
          }}
        />,
      );
    }

    if (
      shape.type === 'rect' ||
      shape.type === 'omrRow' ||
      shape.type === 'textbox' ||
      shape.type === 'table'
    ) {
      const width =
        shape.type === 'table'
          ? (shape.cols || 2) * (shape.cellWidth || 40)
          : (shape.width || 120);
      const height =
        shape.type === 'table'
          ? (shape.rows || 2) * (shape.cellHeight || 24)
          : (shape.height || 40);

      const hx = shape.x + width;
      const hy = shape.y + height;

      handles.push(
        <Rect
          key={`${shape.id}-handle-rectlike`}
          x={hx - HANDLE_SIZE / 2}
          y={hy - HANDLE_SIZE / 2}
          width={HANDLE_SIZE}
          height={HANDLE_SIZE}
          fill="#ffffff"
          stroke="#2563eb"
          strokeWidth={1}
          draggable
          onDragMove={(e) => {
            const cornerX = e.target.x() + HANDLE_SIZE / 2;
            const cornerY = e.target.y() + HANDLE_SIZE / 2;

            if (shape.type === 'table') {
              const cols = shape.cols || 2;
              const rows = shape.rows || 2;
              const newTotalWidth = Math.max(20, cornerX - shape.x);
              const newTotalHeight = Math.max(20, cornerY - shape.y);
              const newCellWidth = Math.max(5, newTotalWidth / cols);
              const newCellHeight = Math.max(5, newTotalHeight / rows);
              onChangeShape(shape.id, {
                cellWidth: newCellWidth,
                cellHeight: newCellHeight,
              });
            } else {
              const newWidth = Math.max(20, cornerX - shape.x);
              const newHeight = Math.max(20, cornerY - shape.y);
              onChangeShape(shape.id, { width: newWidth, height: newHeight });
            }
          }}
        />,
      );
    }

    if (shape.type === 'line') {
      const hx = shape.x + shape.length;
      const hy = shape.y;

      handles.push(
        <Rect
          key={`${shape.id}-handle-line`}
          x={hx - HANDLE_SIZE / 2}
          y={hy - HANDLE_SIZE / 2}
          width={HANDLE_SIZE}
          height={HANDLE_SIZE}
          fill="#ffffff"
          stroke="#2563eb"
          strokeWidth={1}
          draggable
          onDragMove={(e) => {
            const endX = e.target.x() + HANDLE_SIZE / 2;
            const newLength = Math.max(10, endX - shape.x);
            onChangeShape(shape.id, { length: newLength });
          }}
        />,
      );
    }

    if (shape.type === 'text') {
      const baseFontSize = shape.fontSize || 16;
      const hx = shape.x + baseFontSize * 2;
      const hy = shape.y + baseFontSize;

      handles.push(
        <Rect
          key={`${shape.id}-handle-text`}
          x={hx - HANDLE_SIZE / 2}
          y={hy - HANDLE_SIZE / 2}
          width={HANDLE_SIZE}
          height={HANDLE_SIZE}
          fill="#ffffff"
          stroke="#2563eb"
          strokeWidth={1}
          draggable
          onDragMove={(e) => {
            const bottomY = e.target.y() + HANDLE_SIZE / 2;
            const newFontSize = Math.max(8, bottomY - shape.y);
            onChangeShape(shape.id, { fontSize: newFontSize });
          }}
        />,
      );
    }

    // image: bottom-right handle changes width & height (keep aspect ratio)
    if (shape.type === 'image') {
      const width = shape.width || 100;
      const height = shape.height || 100;
      const aspect = (height || 1) / (width || 1);
      const hx = shape.x + width;
      const hy = shape.y + height;

      handles.push(
        <Rect
          key={`${shape.id}-handle-image`}
          x={hx - HANDLE_SIZE / 2}
          y={hy - HANDLE_SIZE / 2}
          width={HANDLE_SIZE}
          height={HANDLE_SIZE}
          fill="#ffffff"
          stroke="#2563eb"
          strokeWidth={1}
          draggable
          onDragMove={(e) => {
            const cornerX = e.target.x() + HANDLE_SIZE / 2;
            const newWidth = Math.max(20, cornerX - shape.x);
            const newHeight = Math.max(20, newWidth * aspect);
            onChangeShape(shape.id, { width: newWidth, height: newHeight });
          }}
        />,
      );
    }

    return handles;
  };

  const selectedShape = shapes.find((s) => s.id === selectedId) || null;

  return (
    <div
      ref={containerRef}
      className="canvas-wrapper"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {editing && (
        <textarea
          style={{
            position: 'absolute',
            top: editing.y,
            left: editing.x,
            width: editing.width,
            height: editing.height,
            fontSize: editing.fontSize,
            padding: '6px',
            margin: 0,
            border: '2px solid #2563eb',
            borderRadius: '4px',
            background: '#ffffff',
            resize: 'none',
            outline: 'none',
            zIndex: 9999,
            boxSizing: 'border-box',
          }}
          autoFocus
          value={editing.text}
          onChange={(e) =>
            setEditing((prev) => (prev ? { ...prev, text: e.target.value } : prev))
          }
          onBlur={finishEditingTextbox}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              finishEditingTextbox();
            }
          }}
        />
      )}

      <Stage
        ref={stageRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="canvas-stage"
        onMouseDown={handleStageMouseDown}
        onTouchStart={handleStageMouseDown}
      >
        <Layer>
          <Rect
            x={0}
            y={0}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            cornerRadius={12}
            fill="#ffffff"
            stroke="#e5e7eb"
            strokeWidth={2}
          />

          {shapes.map((shape) => renderShape(shape, shape.id === selectedId))}
        </Layer>

        <Layer>
          {selectedShape && renderResizeHandles(selectedShape)}
        </Layer>
      </Stage>
    </div>
  );
}