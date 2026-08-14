const STORAGE_KEY = 'todoTasksV1'

const form = document.getElementById('task-form')
const input = document.getElementById('task-input')
const detailsInput = document.getElementById('task-details')
const prioritySelect = document.getElementById('priority-select')
const statusSelect = document.getElementById('status-select')
const dueDateInput = document.getElementById('due-date')
const sortSelect = document.getElementById('sort-select')

const stageContainers = {
  'just-started': document.getElementById('just-started-list'),
  ongoing: document.getElementById('ongoing-list'),
  completed: document.getElementById('completed-list')
}

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

function getStatus(task){
  return task.completed ? 'completed' : (task.status || 'just-started')
}

function createTaskEl(task){
  const el = document.createElement('article')
  const status = getStatus(task)
  el.className = `note ${task.priority.toLowerCase()}`
  if(status === 'completed') el.classList.add('completed')

  const actions = document.createElement('div')
  actions.className = 'actions'

  const chk = document.createElement('input')
  chk.type = 'checkbox'
  chk.checked = status === 'completed'
  chk.addEventListener('change', ()=>{
    task.completed = chk.checked
    task.status = chk.checked ? 'completed' : 'just-started'
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

  const detailToggle = document.createElement('button')
  detailToggle.type = 'button'
  detailToggle.className = 'detail-toggle'
  detailToggle.textContent = task.details ? 'Details' : 'Add details'
  detailToggle.addEventListener('click', ()=>{
    el.classList.toggle('expanded')
    detailToggle.textContent = el.classList.contains('expanded') ? 'Hide' : (task.details ? 'Details' : 'Add details')
  })

  const editBtn = document.createElement('button')
  editBtn.type = 'button'
  editBtn.className = 'edit-btn'
  editBtn.textContent = 'Edit'

  const editForm = document.createElement('form')
  editForm.className = 'edit-form'

  const editTitleInput = document.createElement('input')
  editTitleInput.type = 'text'
  editTitleInput.value = task.text
  editTitleInput.placeholder = 'Task title'

  const editDetailsInput = document.createElement('textarea')
  editDetailsInput.value = task.details || ''
  editDetailsInput.placeholder = 'Task details'

  const editActions = document.createElement('div')
  editActions.className = 'edit-actions'

  const saveBtn = document.createElement('button')
  saveBtn.type = 'submit'
  saveBtn.className = 'save-btn'
  saveBtn.textContent = 'Save'

  const cancelBtn = document.createElement('button')
  cancelBtn.type = 'button'
  cancelBtn.className = 'cancel-btn'
  cancelBtn.textContent = 'Cancel'

  editActions.appendChild(saveBtn)
  editActions.appendChild(cancelBtn)
  editForm.appendChild(editTitleInput)
  editForm.appendChild(editDetailsInput)
  editForm.appendChild(editActions)

  editBtn.addEventListener('click', ()=>{
    editForm.classList.add('visible')
    editTitleInput.focus()
  })

  cancelBtn.addEventListener('click', ()=>{
    editForm.classList.remove('visible')
  })

  editForm.addEventListener('submit', (event)=>{
    event.preventDefault()
    const updatedText = editTitleInput.value.trim()
    if(!updatedText) return

    task.text = updatedText
    task.details = editDetailsInput.value.trim()
    saveTasks(); render()
  })

  const statusSelect = document.createElement('select')
  statusSelect.className = 'task-status-select'
  const options = [
    ['just-started','Just Started'],
    ['ongoing','Ongoing'],
    ['completed','Completed']
  ]
  options.forEach(([value,label])=>{
    const option = document.createElement('option')
    option.value = value
    option.textContent = label
    if(value === status) option.selected = true
    statusSelect.appendChild(option)
  })
  statusSelect.addEventListener('change', ()=>{
    task.status = statusSelect.value
    task.completed = statusSelect.value === 'completed'
    saveTasks(); render()
  })

  const details = document.createElement('div')
  details.className = 'task-details'
  details.textContent = task.details || 'No extra details yet.'

  const row = document.createElement('div')
  row.className = 'task-stage-row'
  const label = document.createElement('span')
  label.className = 'task-label'
  label.textContent = 'Stage'
  row.appendChild(label)
  row.appendChild(detailToggle)
  row.appendChild(editBtn)

  el.appendChild(actions)
  el.appendChild(title)
  el.appendChild(meta)
  el.appendChild(row)
  el.appendChild(statusSelect)
  el.appendChild(editForm)
  el.appendChild(details)

  return el
}

function renderEmpty(container, text){
  container.innerHTML = ''
  const p = document.createElement('p')
  p.className = 'empty-state'
  p.textContent = text
  container.appendChild(p)
}

function sortTasks(list){
  const mode = sortSelect.value
  if(mode === 'priority'){
    const order = {High:0, Medium:1, Low:2}
    return list.slice().sort((a,b)=> (order[a.priority] - order[b.priority]) || (new Date(a.due||0) - new Date(b.due||0)))
  }
  return list.slice().sort((a,b)=>{
    const da = a.due ? new Date(a.due).getTime() : Infinity
    const db = b.due ? new Date(b.due).getTime() : Infinity
    return da - db
  })
}

function render(){
  const ordered = sortTasks(tasks)

  Object.entries(stageContainers).forEach(([name, container]) => {
    container.innerHTML = ''
    const stageTasks = ordered.filter(task => getStatus(task) === name || (name === 'completed' && task.completed))

    if(stageTasks.length === 0){
      renderEmpty(container, name === 'just-started' ? 'No tasks started yet' : name === 'ongoing' ? 'Nothing in progress' : 'No completed tasks')
      return
    }

    stageTasks.forEach(task => container.appendChild(createTaskEl(task)))
  })
}

form.addEventListener('submit', e=>{
  e.preventDefault()
  const text = input.value.trim()
  if(!text) return

  const details = detailsInput.value.trim()
  const task = {
    id: Date.now().toString(36),
    text,
    details,
    priority: prioritySelect.value,
    due: dueDateInput.value || null,
    status: statusSelect.value,
    completed: statusSelect.value === 'completed'
  }

  tasks.push(task)
  saveTasks()
  render()
  form.reset()
  statusSelect.value = 'just-started'
  input.focus()
})

sortSelect.addEventListener('change', ()=> render())

loadTasks(); render()
