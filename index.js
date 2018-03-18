//Global variables
const host = document.getElementById('container');
const storage = window.localStorage;
let orderByName = null;
let error = '';
let limitExceed = false;

//All neccessary functions
const renderForm = () => {
    host.innerHTML += `
        <form>
            <input class="container__form-input name" type='text' placeholder='Task name'>
            <input class="container__form-input text" type='text' placeholder='Task'></input>
            <button class='btn' type='submit'>Add task</button>
        </form>
        <div class='container__error'></div> 
    `;
}

const addTask = task => {
    let taskArr = [];
    const tasks = storage.getItem('myTasks');
    if (tasks) {
        taskArr.push(tasks);
        taskArr.push(JSON.stringify(task));
    } else {
        taskArr[0] = JSON.stringify(task);
    }
    //console.log(taskArr);
    storage.setItem('myTasks', taskArr);
    getTasks();
}

const getTasks = () => {
    let tasks = storage.getItem('myTasks');
    if (tasks) {
        tasks = tasks.replace(/},{/g, "\},/{")
        const taskArr = tasks.split(',/');
        for (let i = 0; i < taskArr.length; i++) {
            taskArr[i] = JSON.parse(taskArr[i]);
        }
        if (taskArr.length == 30) { limitExceed = true; }
        console.log(taskArr);
        renderTasks(taskArr);
    }
}

const renderTasks = taskArr => {
    let tasksContainer;
    document.querySelector('.container__error').innerHTML = '';
    if (!document.querySelector('.container__tasks')) {
        tasksContainer = document.createElement('div');
        tasksContainer.classList.add('container__tasks');
    } else {
        tasksContainer = document.querySelector('.container__tasks');
        tasksContainer.innerHTML = '';
    }
    tasksContainer.innerHTML = `
        <div class='container__tasks-controls'>
            <button class='btn controls' type='button' data-value='delete'>Delete all tasks</button>
            <button class='btn controls' type='button' data-value='sort-id'>Sort by adding order</button>
            <button class='btn controls' type='button' data-value='sort-name'>Sort by name</button>
        </div>   
    `;
    for (let i = 0; i < taskArr.length; i++) {
        tasksContainer.innerHTML += `
            <div class='container__task-item'>
                <div class='container__task-item-left'>
                    <div class='container__task-item-name-wrapper'>
                       ${taskArr[i].name}
                    </div>
                    <div class='container__task-item-text'>${taskArr[i].task}</div>
                </div>
                <div class='container__task-item-right'><button class='btn delete' type='button' data-value='${i}'>Delete</button></div>
            </div>
        `;
    }
    host.appendChild(tasksContainer);

}

const updateTasksList = taskArr => {
    if (taskArr.length < 30) { limitExceed = false; }
    const taskStr = taskArr.join(',');
    storage.setItem('myTasks', taskStr);
    getTasks();
}

const deleteAllTasks = () => {
    storage.clear();
    document.querySelector('.container__tasks').innerHTML = '';
}

const sortTasks = sortBy => {
    const containers = document.querySelectorAll('.container__task-item');
    let containersArr = Array.from(containers);
    let taskArr = [];
    containersArr.forEach(element => {
        let item = {};
        item.name = (element.children[0].children[0].innerHTML);
        item.task = (element.children[0].children[1].innerHTML);
        taskArr.push(item);
    });
    if (sortBy == 'id') {
        taskArr.reverse();
    } else if (sortBy == 'name' && orderByName !== 'sorted') {
        taskArr.sort(sortByName);
        orderByName = 'sorted';
    } else if (sortBy == 'name' && orderByName == 'sorted') {
        taskArr.reverse();
        orderByName = 'reversed';
    }
    console.log(taskArr);
    renderTasks(taskArr);
}

const sortByName = (a, b) => {
        if (a.name > b.name) {
            return 1;
        } else if (a.name < b.name) {
            return -1;
        }
        return 0;

    }
    //Handling buttons clicks
host.addEventListener('submit', e => {
    e.preventDefault();
    if (!e.target.children[0].value && !e.target.children[1].value) {
        error = "It seems you didn't enter any info. Please, try again";
        document.querySelector('.container__error').innerHTML = error;
        e.target.children[0].classList.add('invalid');
        e.target.children[1].classList.add('invalid');
    } else if (!e.target.children[0].value) {
        error = "It seems you didn't enter task name, Please, try again";
        document.querySelector('.container__error').innerHTML = error;
        e.target.children[0].classList.add('invalid');
    } else if (!e.target.children[1].value) {
        error = "It seems you didn't enter task text. Please, try again";
        document.querySelector('.container__error').innerHTML = error;
        e.target.children[1].classList.add('invalid');
    } else if (limitExceed) {
        error = "It seems you exceeded limit of tasks in 30. Please, delete one or more tasks and try again";
        document.querySelector('.container__error').innerHTML = error;
    } else {
        const task = {
            name: e.target.children[0].value,
            task: e.target.children[1].value
        };
        e.target.children[0].value = '';
        e.target.children[1].value = '';
        addTask(task);
    }
});

host.addEventListener('click', e => {
    if (e.target.classList.contains('delete')) {
        let tasks = storage.getItem('myTasks');
        tasks = tasks.replace(/},{/g, "\},/{")
        const taskArr = tasks.split(',/');
        taskArr.splice(e.target.dataset.value, 1);
        updateTasksList(taskArr);
    }
});

host.addEventListener('click', e => {
    if (e.target.dataset.value == 'delete') {
        deleteAllTasks();
    } else if (e.target.dataset.value == 'sort-id') {
        sortTasks('id');
    } else if (e.target.dataset.value == 'sort-name') {
        sortTasks('name');
    }
});

host.addEventListener('input', e => {
    if (e.target.classList.contains('invalid')) {
        e.target.classList.remove('invalid');
    }
});
//Default behavior
renderForm();
getTasks();