'use client'

import { useState } from 'react'
import { Check, Trash2, Plus, Loader2, Bot } from 'lucide-react'
import { addTodo, toggleTodo, deleteTodo, generateAiTodos } from '@/lib/actions/data'

type Todo = {
  id: string
  content: string
  is_completed: boolean
}

export function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos)
  const [newTask, setNewTask] = useState('')
  const [aiPrompt, setAiPrompt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim() || isSubmitting) return

    setIsSubmitting(true)
    
    // Optimistic UI update
    const optimisticId = `temp-${Date.now()}`
    const newTodoObj = { id: optimisticId, content: newTask, is_completed: false }
    setTodos(prev => [...prev, newTodoObj])
    setNewTask('')

    const { success } = await addTodo(newTodoObj.content)
    if (!success) {
      // Revert if failed
      setTodos(prev => prev.filter(t => t.id !== optimisticId))
    }
    
    setIsSubmitting(false)
  }

  const handleGenerateAiTasks = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isGeneratingAi) return

    setIsGeneratingAi(true)
    const res = await generateAiTodos(aiPrompt.trim())
    if (res.success && res.tasks && res.tasks.length > 0) {
      setTodos(prev => [...prev, ...res.tasks])
      setAiPrompt('')
    }
    setIsGeneratingAi(false)
  }

  const handleToggle = async (id: string, currentStatus: boolean) => {
    // Optimistic UI update
    setTodos(prev => prev.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t))
    
    if (!id.startsWith('temp-')) {
      await toggleTodo(id, !currentStatus)
    }
  }

  const handleDelete = async (id: string) => {
    // Optimistic UI update
    setTodos(prev => prev.filter(t => t.id !== id))
    
    if (!id.startsWith('temp-')) {
      await deleteTodo(id)
    }
  }

  const completedCount = todos.filter(t => t.is_completed).length

  return (
    <section className="bg-card border border-border rounded-2xl p-6 flex-1 flex flex-col min-h-[300px] shadow-md">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-xl font-extrabold text-foreground">Today's Mission</h3>
          <p className="text-xs text-text-muted mt-0.5">
            {todos.length} focused task{todos.length !== 1 ? 's' : ''} · {completedCount} completed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-[11px] font-bold">
            AI-ready
          </span>
        </div>
      </div>

      {/* AI Task Generator Bar */}
      <form onSubmit={handleGenerateAiTasks} className="mb-4">
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-surface-2 border border-primary/20">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Ask AI to add study tasks (e.g., 'Add 3 tasks for Analog Circuits')..."
            className="flex-1 bg-transparent px-3 py-1.5 text-xs text-foreground placeholder-text-muted focus:outline-none"
          />
          <button
            type="submit"
            disabled={isGeneratingAi}
            className="px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold inline-flex items-center gap-1.5 shrink-0 transition-all disabled:opacity-50"
          >
            {isGeneratingAi ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding...
              </>
            ) : (
              <>
                Ask AI to Add Tasks
              </>
            )}
          </button>
        </div>
      </form>

      {/* Add Task Manual Form */}
      <form onSubmit={handleAddTodo} className="relative mb-6">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="+ Add task manually..."
          className="w-full bg-background border border-border rounded-xl py-2.5 pl-4 pr-12 text-sm text-foreground placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
        />
        <button
          type="submit"
          disabled={!newTask.trim() || isSubmitting}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-text-muted hover:text-foreground hover:bg-surface-2 transition-all disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        </button>
      </form>

      {/* Todo List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2 space-y-3">
        {todos.length === 0 ? (
          <div className="text-center py-8 text-text-muted text-sm">
            No tasks yet. Ask AI above or add a task manually!
          </div>
        ) : (
          todos.map(todo => (
            <div 
              key={todo.id} 
              className={`group flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                todo.is_completed 
                  ? 'bg-success/10 border-success/20' 
                  : 'bg-surface-2 border-border hover:border-border/80'
              }`}
            >
              <div 
                className="flex items-center gap-3 flex-1 cursor-pointer"
                onClick={() => handleToggle(todo.id, todo.is_completed)}
              >
                <div 
                  className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors ${
                    todo.is_completed ? 'bg-success text-white' : 'border border-text-muted/50'
                  }`}
                >
                  {todo.is_completed && <Check className="w-3.5 h-3.5" />}
                </div>
                <span 
                  className={`text-sm transition-all ${
                    todo.is_completed ? 'text-text-muted line-through' : 'text-foreground font-medium'
                  }`}
                >
                  {todo.content}
                </span>
              </div>
              
              <button
                onClick={() => handleDelete(todo.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-all ml-2"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
