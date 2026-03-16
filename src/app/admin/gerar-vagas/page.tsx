"use client";

import { useState } from "react";
import { Plus, Trash2, Copy, Check } from "lucide-react";

export default function GerarVagasPage() {
  const [titulo, setTitulo] = useState("");
  const [dinamicos, setDinamicos] = useState([""]);
  const [telefone, setTelefone] = useState("");
  const [copied, setCopied] = useState(false);

  const addDinamico = () => {
    setDinamicos([...dinamicos, ""]);
  };

  const removeDinamico = (index: number) => {
    const newDinamicos = dinamicos.filter((_, i) => i !== index);
    setDinamicos(newDinamicos);
  };

  const updateDinamico = (index: number, value: string) => {
    const newDinamicos = [...dinamicos];
    newDinamicos[index] = value;
    setDinamicos(newDinamicos);
  };

  const handleCopy = () => {
    const parts = [];
    if (titulo) {
      // Usar formatação do WhatsApp com asteriscos para ficar em negrito
      parts.push(`*${titulo.toUpperCase()}*`);
    }
    
    const validDinamicos = dinamicos.filter(item => item.trim() !== '');
    if (validDinamicos.length > 0) {
      parts.push(validDinamicos.map(item => `👷 ${item}`).join('\n'));
    }

    if (telefone) {
      parts.push(`☎️ ${telefone}`);
    }

    parts.push(`💭 entrar no grupo, enviar currículo https://chat.whatsapp.com/KIYDOOBhx9LLc9hWOKmFOE`);
    parts.push(`⚠️ ENVIEM SEUS CURRÍCULOS para eu colocar no sistema de recrutamento`);

    // Une os blocos com dois newlines (quebra de linha dupla)
    const textToCopy = parts.join('\n\n');
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full p-6">
      {/* Lado Esquerdo - Formulário */}
      <div className="flex-1 bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
        <h2 className="text-xl font-bold mb-6 text-zinc-800">Gerador de Vagas</h2>
        
        <div className="space-y-6">
          {/* Input 1 */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Título</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all"
              placeholder="Digite o título"
            />
          </div>

          {/* Input 2 (Dinâmico) */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-zinc-700 mb-1">Requisitos / Atividades</label>
            {dinamicos.map((item, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateDinamico(index, e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all"
                  placeholder="Digite aqui..."
                />
                {index === dinamicos.length - 1 ? (
                  <button
                    onClick={addDinamico}
                    type="button"
                    className="p-2 bg-zinc-100 text-zinc-700 rounded-md hover:bg-zinc-200 transition-colors"
                    title="Adicionar novo campo"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => removeDinamico(index)}
                    type="button"
                    className="p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                    title="Remover campo"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Input 3 */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Telefone / Contato</label>
            <input
              type="text"
              value={telefone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                let formatted = "";
                if (val) {
                  if (val.length <= 2) {
                    formatted = `(${val}`;
                  } else if (val.length <= 7) {
                    formatted = `(${val.slice(0, 2)}) ${val.slice(2)}`;
                  } else {
                    formatted = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7, 11)}`;
                  }
                }
                setTelefone(formatted);
              }}
              className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all"
              placeholder="(99) 99999-9999"
              maxLength={15}
            />
          </div>
        </div>
      </div>

      {/* Lado Direito - Preview */}
      <div className="flex-1 bg-white p-6 rounded-lg shadow-sm border border-zinc-200 flex flex-col">
        <h2 className="text-xl font-bold mb-6 text-zinc-800">Preview</h2>
        
        <div className="bg-zinc-50 p-6 rounded-lg min-h-[300px] whitespace-pre-wrap flex flex-col text-zinc-900 border border-zinc-200 flex-1">
          {titulo && (
            <div className="font-bold uppercase text-lg mb-4">
              {titulo}
            </div>
          )}
          
          {dinamicos.some(item => item.trim() !== '') && (
            <div className={`text-zinc-800 ${telefone ? 'mb-4' : ''}`}>
              {dinamicos.filter(item => item.trim() !== '').map((item, index) => (
                <div key={index}>
                  👷 {item}
                </div>
              ))}
            </div>
          )}

          {telefone && (
            <div className="text-zinc-800">
              ☎️ {telefone}
            </div>
          )}
          
          {(titulo || dinamicos.some(item => item.trim() !== '') || telefone) && (
            <>
              <div className="text-zinc-800 mt-4">
                💭 entrar no grupo, enviar currículo https://chat.whatsapp.com/KIYDOOBhx9LLc9hWOKmFOE
              </div>
              <div className="text-zinc-800 mt-4">
                ⚠️ ENVIEM SEUS CURRÍCULOS para eu colocar no sistema de recrutamento
              </div>
            </>
          )}
          
          {!titulo && !dinamicos.some(item => item.trim() !== '') && !telefone && (
            <div className="text-zinc-400 italic text-center py-10 my-auto">
              Preencha o formulário ao lado para ver o preview.
            </div>
          )}
        </div>

        {/* Botão Copiar */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-6 py-2 rounded-md font-medium transition-colors ${
              copied 
                ? "bg-green-100 text-green-700 hover:bg-green-200" 
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                COPIADO!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                COPIAR
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
