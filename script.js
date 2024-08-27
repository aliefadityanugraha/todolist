document.getElementById('add-task').addEventListener('click', function() {
    const taskText = document.getElementById('new-task').value;

    if (taskText !== '') {
        addTask(taskText);
        document.getElementById('new-task').value = '';
    }
});

// Load tasks and dark mode setting from localStorage on page load
window.onload = function() {
    loadTasks();
    loadDarkMode();
    showGreeting();
};

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => {
        addTaskToDOM(task.text, task.date, task.completed);
    });
}

function saveTasks() {
    const tasks = [];
    document.querySelectorAll('#task-list li').forEach(listItem => {
        const taskText = listItem.querySelector('span').textContent;
        const taskDate = listItem.querySelector('.badge').textContent;
        const completed = listItem.querySelector('span').style.textDecoration === 'line-through';
        tasks.push({ text: taskText, date: taskDate, completed });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function addTask(taskText) {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleString();
    addTaskToDOM(taskText, formattedDate, false);
    saveTasks();
}

function addTaskToDOM(taskText, taskDate, isCompleted) {
    const taskList = document.getElementById('task-list');
    const listItem = document.createElement('li');
    listItem.className = 'list-group-item d-flex justify-content-between align-items-center';

    // Apply dark mode class if needed
    if (document.body.classList.contains('dark-mode')) {
        listItem.classList.add('dark-mode');
    }

    // Create a span for the task content
    const taskContent = document.createElement('span');
    taskContent.textContent = taskText;
    if (isCompleted) {
        taskContent.style.textDecoration = 'line-through';
    }

    // Create a span for the date
    const dateSpan = document.createElement('span');
    dateSpan.className = 'badge badge-info ml-2';
    dateSpan.textContent = taskDate;

    // Create the buttons
    const completeButton = document.createElement('button');
    completeButton.textContent = 'Complete';
    completeButton.className = 'btn btn-success btn-sm ml-2';

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.className = 'btn btn-primary btn-sm ml-2';

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'btn btn-danger btn-sm ml-2';

    // Append the elements to the list item
    listItem.appendChild(taskContent);
    listItem.appendChild(dateSpan);
    listItem.appendChild(completeButton);
    listItem.appendChild(editButton);
    listItem.appendChild(deleteButton);

    taskList.appendChild(listItem);

    let deleteTarget;

    // Event listener for delete confirmation
    deleteButton.addEventListener('click', function() {
        deleteTarget = listItem;
        $('#deleteModal').modal('show');
    });

    // Confirm deletion
    document.getElementById('confirm-delete').addEventListener('click', function() {
        if (deleteTarget) {
            taskList.removeChild(deleteTarget);
            deleteTarget = null;
            saveTasks();
            $('#deleteModal').modal('hide');
        }
    });

    // Event listener for marking task as complete
    completeButton.addEventListener('click', function() {
        taskContent.style.textDecoration = taskContent.style.textDecoration === 'line-through' ? 'none' : 'line-through';
        saveTasks();
    });

    // Event listener for editing the task
    editButton.addEventListener('click', function() {
        if (editButton.textContent === 'Edit') {
            const editInput = document.createElement('input');
            editInput.type = 'text';
            editInput.value = taskContent.textContent;
            editInput.className = 'form-control mr-2';
            listItem.insertBefore(editInput, taskContent);
            listItem.removeChild(taskContent);

            editButton.textContent = 'Save';
        } else {
            const newTaskText = listItem.querySelector('input').value;
            taskContent.textContent = newTaskText;
            listItem.insertBefore(taskContent, listItem.querySelector('input'));
            listItem.removeChild(listItem.querySelector('input'));

            editButton.textContent = 'Edit';
            saveTasks();
        }
    });
}

// Dark mode toggle
document.getElementById('dark-mode-toggle').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    document.querySelector('.card').classList.toggle('dark-mode');
    document.querySelectorAll('.list-group-item').forEach(item => {
        item.classList.toggle('dark-mode');
    });

    // Save dark mode setting
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});

// Load dark mode setting from localStorage
function loadDarkMode() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
        document.querySelector('.card').classList.add('dark-mode');
        document.querySelectorAll('.list-group-item').forEach(item => {
            item.classList.add('dark-mode');
        });
    }
}

// Show greeting message
function showGreeting() {
    const greetingAlert = document.getElementById('greeting-alert');
    if (greetingAlert) {
        setTimeout(() => {
            greetingAlert.classList.add('show');
        }, 100);
    }
}

// Export resume to PDF
document.getElementById('export-resume').addEventListener('click', function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("To-Do List", 10, 10);
    doc.text("Tasks:", 10, 20);

    let yPosition = 30;
    document.querySelectorAll('#task-list li').forEach(listItem => {
        const taskText = listItem.querySelector('span').textContent;
        const taskDate = listItem.querySelector('.badge').textContent;
        const status = listItem.querySelector('span').style.textDecoration === 'line-through' ? 'Completed' : 'Pending';
        
        doc.text(`${taskText} (Date: ${taskDate}) - ${status}`, 10, yPosition);
        yPosition += 10;
    });

    doc.save('resume.pdf');
});
