import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function SavedTemplate() {
    const [templates, setTemplates] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('omr-templates') || '[]');
        setTemplates(stored);
    }, []);

    const handleDelete = (id) => {
        const updated = templates.filter((t) => t.id !== id);
        setTemplates(updated);
        localStorage.setItem('omr-templates', JSON.stringify(updated));
    };

    const handleEdit = (id) => {
        router.push(`/designer?templateId=${id}`);
    };

    const handleCreateNew = () => {
        router.push('/designer?new=true');
    };

    return (
        <main className="home">
            <div className="home-card" style={{ maxWidth: 700 }}>
                <h1>Saved Templates</h1>

                <button
                    className="primary-link"
                    style={{ marginBottom: '1rem' }}
                    onClick={handleCreateNew}
                >
                    + Create New Template
                </button>

                {templates.length === 0 ? (
                    <p className="home-hint">No templates saved yet.</p>
                ) : (
                    templates.map((tpl) => (
                        <div
                            key={tpl.id}
                            style={{
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                padding: '0.75rem',
                                marginBottom: '0.6rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <div>
                                <strong>{tpl.name}</strong>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                    {new Date(tpl.createdAt).toLocaleString()}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    className="toolbar-btn"
                                    onClick={() => handleEdit(tpl.id)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="toolbar-btn toolbar-btn-secondary"
                                    onClick={() => handleDelete(tpl.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}

                <Link href="/" style={{ display: 'block', marginTop: '1rem' }}>
                    ← Back to Home
                </Link>
            </div>
        </main>
    );
}