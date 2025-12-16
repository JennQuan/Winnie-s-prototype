# OMR Designer (Drag & Drop) – Next.js + React + Konva

This project is a draw.io-style layout tool focused on building OMR sheets.

## Features

- Drag shapes from the left toolbar onto the central canvas:
  - Circle bubble
  - Rectangle
  - OMR row (4 bubbles by default)
  - Text label
  - Horizontal line
- Drag shapes directly on the canvas to reposition them.
- Edit properties of the selected shape on the right:
  - Position (x, y)
  - Size (width / height / radius / length)
  - Stroke width
  - Fill color (for circles/rectangles/rows)
  - Text + font size + color (for text labels)
  - Bubble count (for OMR rows)
- Duplicate and delete shapes.
- **Z‑order controls**: bring shape to front, send shape to back.
- **Auto-generate question rows**:
  - Choose 10 / 20 / 50 / 100 rows from a dropdown.
  - Automatically creates numbered rows (1–N) with OMR bubbles.
- Export the current layout as JSON.
- Import JSON to restore a saved template.
- **Export to PDF**:
  - Renders the canvas to an A4 portrait PDF (using jsPDF) and downloads it
    as `omr-sheet.pdf`.

There is **no fixed printed background** in this version (blank sheet), so you can
design your own OMR layout from scratch.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open your browser at:

   ```
   http://localhost:3000
   ```

4. Click **"Open Designer"** to go to the shape editor.

## Notes

- Drag shapes from the left onto the canvas.
- Use the "Auto-generate questions" section in the toolbar to quickly create
  rows 1–N.
- Use the "Export to PDF" button to download an A4 PDF of the current sheet.
- Use the JSON editor in the sidebar to save / load full templates.
