'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft } from 'lucide-react'
import { Editor } from '@tinymce/tinymce-react'

interface BlogFormProps {
    data: any
    categories: { id: string, name: string }[]
}

export default function BlogFormClient({ data, categories }: BlogFormProps) {
    const router = useRouter()
    const isNew = !data
    const editorRef = useRef<any>(null)

    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: data?.title || '',
        slug: data?.slug || '',
        categoryId: data?.categoryId || (categories[0]?.id || ''),
        excerpt: data?.excerpt || '',
        content: data?.content || '',
        tags: data?.tags || '',
        authorName: data?.authorName || 'Autor Exemplo',
        authorRole: data?.authorRole || 'Especialista',
        readingTime: data?.readingTime || 5,
        featured: data?.featured || false,
        imageUrl: data?.imageUrl || '/blog-placeholder.png'
    })

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            // Em uma impl. real teríamos uma action "salvarPostBlog(payload)"
            alert('Artigo salvo com sucesso! (Demostração)')
            router.push('/admin/blog')
        } catch (error) {
            console.error('Erro ao salvar:', error)
            alert('Erro ao salvar artigo.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <Link href="/admin/blog" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', background: '#f1f5f9', color: '#64748b' }}>
                    <ArrowLeft size={18} />
                </Link>
                <div>
                    <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#09355F' }}>{isNew ? 'Novo Artigo' : 'Editar Artigo'}</h1>
                </div>
            </div>

            <div style={{ background: '#fff', padding: '2rem', borderRadius: 14, border: '1.5px solid #e8edf5', boxShadow: '0 2px 8px rgba(9,53,95,0.04)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    <div>
                        <label className="input-label" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>Título do Artigo</label>
                        <input name="title" value={formData.title} onChange={handleChange} className="input-field" style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: 6 }} placeholder="Ex: Como fazer um currículo..." />
                    </div>
                    <div>
                        <label className="input-label" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>Slug (URL)</label>
                        <input name="slug" value={formData.slug} onChange={handleChange} className="input-field" style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: 6 }} placeholder="Ex: como-fazer-curriculo" />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    <div>
                        <label className="input-label" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>Categoria</label>
                        <select name="categoryId" value={formData.categoryId} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: 6, background: '#fff' }}>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="input-label" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>Tags (separadas por vírgula)</label>
                        <input name="tags" value={formData.tags} onChange={handleChange} className="input-field" style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: 6 }} placeholder="Ex: carreira, dicas, RH" />
                    </div>
                </div>

                <div>
                    <label className="input-label" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>Resumo</label>
                    <textarea name="excerpt" value={formData.excerpt} onChange={handleChange} rows={3} style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: 6 }} placeholder="Texto curto para a lista..." />
                </div>

                <div>
                    <label className="input-label" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>Conteúdo do Artigo</label>
                    <Editor
                        apiKey="hfbrdlx9zeg2i65y5mf53m35wydp27ldk6zx0dfvyrxsbl92"
                        onInit={(_evt, editor) => editorRef.current = editor}
                        initialValue={formData.content}
                        init={{
                            height: 400,
                            menubar: false,
                            plugins: [
                                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                            ],
                            toolbar: 'undo redo | blocks | ' +
                                'bold italic forecolor | alignleft aligncenter ' +
                                'alignright alignjustify | bullist numlist outdent indent | ' +
                                'removeformat | help',
                            content_style: 'body { font-family:Inter,Helvetica,Arial,sans-serif; font-size:16px; color:#334155; }'
                        }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', padding: '1.5rem', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <div>
                        <label className="input-label" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>Autor (Nome)</label>
                        <input name="authorName" value={formData.authorName} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: 6 }} />
                    </div>
                    <div>
                        <label className="input-label" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>Tempo Leitura (min)</label>
                        <input type="number" name="readingTime" value={formData.readingTime} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: 6 }} />
                    </div>
                    <div>
                        <label className="input-label" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>URL Imagem Capa</label>
                        <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: 6 }} />
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" id="featured" name="featured" checked={formData.featured} onChange={handleChange} />
                    <label htmlFor="featured" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>Marcar como Destaque</label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                    <button 
                        onClick={handleSave} 
                        disabled={loading}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #09355F, #0d4a80)', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: 8, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
                        <Save size={18} /> {loading ? 'Salvando...' : 'Salvar Artigo'}
                    </button>
                </div>

            </div>
        </div>
    )
}
