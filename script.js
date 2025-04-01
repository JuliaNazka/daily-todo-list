document.addEventListener('DOMContentLoaded', () => {
    let selectedPriority = 'high';

    // Elementos DOM
    const taskInput = document.getElementById('taskInput');
    const addButton = document.getElementById('addButton');
    const taskList = document.getElementById('taskList');
    const completedCount = document.getElementById('completedCount');

    // Função para converter prioridade em número (ordem desejada: alta (1), média (2), alta (3))
    function getPriorityOrder(priority) {
        if (priority === 'high') return 1;
        if (priority === 'medium') return 2;
        if (priority === 'low') return 3;

        return 4;
    }

    // Seletor de Prioridade
    document.querySelectorAll('.priority-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedPriority = btn.dataset.priority;
        });
    });

    // Carregar tarefas salvas
    loadTasks();

    // Event Listeners
    addButton.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') {
            taskInput.classList.add('error');
            setTimeout(() => taskInput.classList.remove('error'), 2000);
            return;
        }

        const taskItem = createTaskElement(taskText, selectedPriority, false);
        insertTaskItem(taskItem);
        taskInput.value = '';
        saveTasks();
    }

    // Insere uma tarefa pendente na posição correta de acordo com sua prioridade
    function insertTaskItem(taskItem) {
        const newTaskOrder = getPriorityOrder(
            taskItem.classList.contains('priority-high') ? 'high' : 
            taskItem.classList.contains('priority-low') ? 'low' : 'medium'
        );
        let inserted = false;
        // Percorre os itens pendentes (não concluídos)
        for (const child of taskList.children) {
            if (!child.classList.contains('completed')) {
                let childOrder = getPriorityOrder(
                    child.classList.contains('priority-high') ? 'high' : 
                    child.classList.contains('priority-low') ? 'low' : 'medium'
                );
                if (newTaskOrder < childOrder) {
                    taskList.insertBefore(taskItem, child);
                    inserted = true;
                    break;
                }
            }
        }
        if (!inserted) {
            // Se não encontrou um lugar entre os pendentes, insere antes do primeiro concluído, se houver
            let insertedInCompleted = false;
            for (const child of taskList.children) {
                if (child.classList.contains('completed')) {
                    taskList.insertBefore(taskItem, child);
                    insertedInCompleted = true;
                    break;
                }
            }
            if (!insertedInCompleted) {
                taskList.appendChild(taskItem);
            }
        }
    }

    function createTaskElement(text, priority, completed) {
        const li = document.createElement('li');
        li.className = `task-item priority-${priority}`;
        if (completed) li.classList.add('completed');

        li.innerHTML = `
            <div class="priority-indicator"></div>
            <span class="task-text">${text}</span>
            <div class="task-actions">
                <button class="complete">✓</button>
                <button class="delete">✕</button>
            </div>
        `;

        li.querySelector('.complete').addEventListener('click', toggleComplete);
        li.querySelector('.delete').addEventListener('click', deleteTask);

        return li;
    }

    function toggleComplete(e) {
        const taskItem = e.target.closest('.task-item');
        taskItem.classList.toggle('completed');
        taskList.removeChild(taskItem);

        if (taskItem.classList.contains('completed')) {
            // Se concluída, adiciona no final (entre as concluídas)
            taskList.appendChild(taskItem);
        } else {
            // Se pendente, insere na posição correta
            insertTaskItem(taskItem);
        }
        updateCompletedCount();
        saveTasks();
    }

    function deleteTask(e) {
        const taskItem = e.target.closest('.task-item');
        taskItem.remove();
        updateCompletedCount();
        saveTasks();
    }

    function updateCompletedCount() {
        completedCount.textContent = document.querySelectorAll('.task-item.completed').length;
    }

    function saveTasks() {
        const tasks = [];
        document.querySelectorAll('.task-item').forEach(task => {
            tasks.push({
                text: task.querySelector('.task-text').textContent,
                completed: task.classList.contains('completed'),
                priority: task.classList.contains('priority-high') ? 'high' :
                          task.classList.contains('priority-low') ? 'low' : 'medium'
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => {
            const taskItem = createTaskElement(task.text, task.priority, task.completed);
            if (task.completed) {
                taskList.appendChild(taskItem);
            } else {
                insertTaskItem(taskItem);
            }
        });
        updateCompletedCount();
    }
});
