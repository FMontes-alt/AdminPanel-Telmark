"use client"

interface TrueFalseEditorProps {
    options: { text: string; isCorrect: boolean }[]
    setOptions: (options: { text: string; isCorrect: boolean }[]) => void
}

export default function TrueFalseEditor({ options, setOptions }: TrueFalseEditorProps) {
    const toggleOptionCorrect = (index: number) => {
        const updated = [
            { text: "Verdadero", isCorrect: index === 0 },
            { text: "Falso", isCorrect: index === 1 },
        ]
        setOptions(updated)
    }

    return (
        <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                ¿Cuál es la respuesta correcta?
            </label>
            <div className="grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={() => toggleOptionCorrect(0)}
                    className={`py-4 rounded-2xl font-bold text-sm transition-all ${
                        options[0]?.isCorrect
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200 shadow-sm"
                    }`}
                >
                    Verdadero
                </button>
                <button
                    type="button"
                    onClick={() => toggleOptionCorrect(1)}
                    className={`py-4 rounded-2xl font-bold text-sm transition-all ${
                        options[1]?.isCorrect
                            ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200 shadow-sm"
                    }`}
                >
                    Falso
                </button>
            </div>
        </div>
    )
}
