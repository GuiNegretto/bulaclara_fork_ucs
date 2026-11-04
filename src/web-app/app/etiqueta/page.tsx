'use client'

export default function EtiquetaPage() {

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Gerador de Etiquetas</h1>
      <p className="text-gray-600 mb-8">Crie etiquetas para organizar seus medicamentos.</p>
      
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🏷️</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Página em construção</h3>
          <p className="text-gray-500">
            Esta funcionalidade será implementada em breve.
            <br />
            Você poderá gerar etiquetas personalizadas com horários de uso.
          </p>
        </div>
      </div>
    </div>
  )
}

  const addHorario = () => {
    setFormData(prev => ({
      ...prev,
      horarios: [...prev.horarios, '12:00']
    }))
  }

  const removeHorario = (index: number) => {
    if (formData.horarios.length <= 1) {
      alert('É necessário pelo menos um horário.')
      return
    }
    setFormData(prev => ({
      ...prev,
      horarios: prev.horarios.filter((_, i) => i !== index)
    }))
  }

  const updateHorario = (index: number, value: string) => {
    const newHorarios = [...formData.horarios]
    newHorarios[index] = value
    setFormData(prev => ({ ...prev, horarios: newHorarios }))
  }

  const validateForm = () => {
    if (!formData.nomeMedicamento.trim()) {
      setError('Nome do medicamento é obrigatório.')
      return false
    }
    if (!formData.dosagem.trim()) {
      setError('Dosagem é obrigatória.')
      return false
    }
    if (formData.horarios.length === 0) {
      setError('É necessário pelo menos um horário de uso.')
      return false
    }
    
    // Validar formato dos horários
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    for (const horario of formData.horarios) {
      if (!timeRegex.test(horario)) {
        setError(`Horário inválido: ${horario}. Use o formato HH:MM (ex: 08:00).`)
        return false
      }
    }
    
    setError(null)
    return true
  }

  const gerarEtiqueta = async () => {
    if (!validateForm()) return
    
    try {
      setIsGenerating(true)
      setError(null)
      
      // Simulação de chamada à API - em produção, chamaria /api/v1/etiquetas/gerar
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const mockEtiqueta = {
        id: `ETQ-${Date.now().toString().slice(-6)}`,
        nomeMedicamento: formData.nomeMedicamento || 'Medicamento Exemplo',
        gtin: formData.gtin || '7896541200031',
        dosagem: formData.dosagem,
        horariosUso: formData.horarios,
        observacoes: formData.observacoes,
        dataGeracao: new Date().toISOString(),
        larguraCm: 10.0,
        alturaCm: 5.0,
        downloadPdfUrl: `/api/v1/etiquetas/download/etiqueta-${Date.now()}.pdf`
      }
      
      setEtiquetaGerada(mockEtiqueta)
      alert('Etiqueta gerada com sucesso!')
      
    } catch (err) {
      setError('Erro ao gerar etiqueta. Tente novamente.')
      console.error('Erro ao gerar etiqueta:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const salvarRascunho = () => {
    localStorage.setItem('etiqueta_rascunho', JSON.stringify(formData))
    alert('Rascunho salvo com sucesso!')
  }

  const carregarRascunho = () => {
    const rascunho = localStorage.getItem('etiqueta_rascunho')
    if (rascunho) {
      setFormData(JSON.parse(rascunho))
      alert('Rascunho carregado com sucesso!')
    } else {
      alert('Nenhum rascunho encontrado.')
    }
  }