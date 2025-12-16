import Link from 'next/link';

export default function Home() {
  return (
    <main className="home">
      <div className="home-card">
        <h1>OMR Designer (Drag & Drop)</h1>
        <p>
          Drag shapes from the left toolbar onto the canvas, move them around,
          and edit their properties on the right. Export and import layouts as JSON.
        </p>

        {/* ONLY CHANGE IS HERE */}
        <Link href="/savedTemplate" className="primary-link">
          Open Designer
        </Link>

        <p className="home-hint">
          This version uses real drag-and-drop from the toolbar into the canvas,
          similar to diagram tools like draw.io.
        </p>
      </div>
    </main>
  );
}