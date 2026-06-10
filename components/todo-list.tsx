'use client'

import { useState } from 'react'
import { Check, Trash2, Plus, Loader2 } from 'lucide-react'
import { addTodo, toggleTodo, deleteTodo } from '@/lib/actions/data'

type Todo = {
  id: string
  content: string
  is_completed: boolean
}

export function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos)
  const [newTask, setNewTask] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    <section className="glass rounded-2xl p-6 flex-1 flex flex-col min-h-[300px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white">Daily Tasks</h3>
          <p className="text-sm text-text-muted">
            {completedCount} of {todos.length} completed
          </p>
        </div>
      </div>

      {/* Add Task Form */}
      <form onSubmit={handleAddTodo} className="relative mb-6">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="w-full bg-[#131b2e] border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-text-muted focus:outline-none focus:border-indigo/50 transition-colors"
        />
        <button
          type="submit"
          disabled={!newTask.trim() || isSubmitting}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-text-muted hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        </button>
      </form>

      {/* Todo List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2 space-y-3">
        {todos.length === 0 ? (
          <div className="text-center py-8 text-text-muted text-sm">
            You have no tasks. Add one above!
          </div>
        ) : (
          todos.map(todo => (
            <div 
              key={todo.id} 
              className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${
                todo.is_completed 
                  ? 'bg-success/5 border-success/20' 
                  : 'bg-surface-2/30 border-white/5 hover:border-white/10'
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
                    todo.is_completed ? 'text-text-muted line-through' : 'text-white'
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
