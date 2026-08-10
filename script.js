const STORAGE_KEY = 'todoTasksV1'

const form = document.getElementById('task-form')
const input = document.getElementById('task-input')
const prioritySelect = document.getElementById('priority-select')
const dueDateInput = document.getElementById('due-date')
const listEl = document.getElementById('task-list')
const sortSelect = document.getElementById('sort-select')

let tasks = []

function loadTasks(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY)
    tasks = raw ? JSON.parse(raw) : []
  }catch(e){tasks = []}
}

function saveTasks(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

function createTaskEl(task){
  const el = document.createElement('article')
  el.className = `note ${task.priority.toLowerCase()}`
  if(task.completed) el.classList.add('completed')

  const actions = document.createElement('div')
  actions.className = 'actions'

  const chk = document.createElement('input')
  chk.type = 'checkbox'
  chk.checked = !!task.completed
  chk.addEventListener('change', ()=>{
    task.completed = chk.checked
    saveTasks(); render()
  })

  const delBtn = document.createElement('button')
  delBtn.title = 'Delete'
  delBtn.textContent = '✕'
  delBtn.addEventListener('click', ()=>{
    tasks = tasks.filter(t=>t.id !== task.id)
    saveTasks(); render()
  })

  actions.appendChild(chk)
  actions.appendChild(delBtn)

  const title = document.createElement('h3')
  title.className = 'title'
  title.textContent = task.text

  const meta = document.createElement('div')
  meta.className = 'meta'
  const dueText = task.due ? new Date(task.due).toLocaleDateString() : 'No due date'
  meta.textContent = `${task.priority} • ${dueText}`

  el.appendChild(actions)
  el.appendChild(title)
  el.appendChild(meta)

  return el
}

function sortTasks(list){
  const mode = sortSelect.value
  if(mode === 'priority'){
    const order = {High:0, Medium:1, Low:2}
    return list.slice().sort((a,b)=> (order[a.priority] - order[b.priority]) || (new Date(a.due||0) - new Date(b.due||0)))
  }else{
    return list.slice().sort((a,b)=>{
      const da = a.due ? new Date(a.due).getTime() : Infinity
      const db = b.due ? new Date(b.due).getTime() : Infinity
      return da - db
    })
  }
}

function render(){
  listEl.innerHTML = ''
  const ordered = sortTasks(tasks)
  if(ordered.length===0){
    const p = document.createElement('p'); p.textContent='No tasks yet — add one!'; p.style.color='#6b6b6b'
    listEl.appendChild(p); return
  }
  ordered.forEach(t=> listEl.appendChild(createTaskEl(t)))
}

form.addEventListener('submit', e=>{
  e.preventDefault()
  const text = input.value.trim()
  if(!text) return
  const task = {
    id: Date.now().toString(36),
    text,
    priority: prioritySelect.value,
    due: dueDateInput.value || null,
    completed: false
  }
  tasks.push(task)
  saveTasks()
  render()
  form.reset()
  input.focus()
})

sortSelect.addEventListener('change', ()=> render())

// initialize
loadTasks(); render()
