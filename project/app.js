const ul = document.getElementById('items_ul')
const form = document.getElementById('add_item')

let id = null

$(document).ready(function(){
    $('.modal').modal({

    });
});

function deleteElementById (id) {
    let li = document.getElementById(id)
    ul.removeChild(li)
}

function searchEmployeesByName() {
    const searchQuery = document.getElementById('nameSearchInput').value.toLowerCase()
    const employees = document.querySelectorAll('.collection-item')

    employees.forEach(employee => {
        const name = employee.querySelector('.title').textContent.toLowerCase()
        if (name.includes(searchQuery)) {
            employee.style.display = 'block'
        } else {
            employee.style.display = 'none'
        }
    })
}

function sortEmployeesByName() {
    const employeeList = document.getElementById('items_ul')
    const employees = Array.from(employeeList.children)

    employees.sort((a,b) => {
        const nameA = a.querySelector('.title').textContent
        const nameB = b.querySelector('.title').textContent

        return nameA.localeCompare(nameB)
    })

    employeeList.innerHTML = ''

    employees.forEach(employee => {
        employeeList.appendChild(employee)
    })
}

function sortEmployeesByDesc() {
    const employeeList = document.getElementById('items_ul')
    const employees = Array.from(employeeList.children)

    employees.sort((a,b) => {
        const descA = a.querySelector('p').textContent
        const descB = b.querySelector('p').textContent

        return descA.localeCompare(descB)
    })

    employeeList.innerHTML = ''

    employees.forEach(employee => {
        employeeList.appendChild(employee)
    })
}

function searchEmployeesByDesc() {
    const searchQuery = document.getElementById('descSearchInput').value.toLowerCase()
    const employees = document.querySelectorAll('.collection-item')

    employees.forEach(employee => {
        const description = employee.querySelector('p').textContent.toLowerCase()
        if (description.includes(searchQuery)) {
            employee.style.display = 'block'
        } else {
            employee.style.display = 'none'
        }
    })
}

const saveChangesButton = document.getElementById('saveChangesBtn');

saveChangesButton.addEventListener('click', () => {
    console.log(id)
    const editedName = document.getElementById('edit_employee_name').value;
    const editedDescription = document.getElementById('edit_employee_description').value;
    const editedImage = document.getElementById('edit_employee_image').value;

    db.collection("employees").doc(id).update({
        employee_name: editedName,
        employee_description: editedDescription,
        employee_image: editedImage
    }).then(() => {
        console.log('Employee Info Updated');

        const image = document.getElementById(id).querySelector('img')
        image.src = editedImage

        const modalInstance = M.Modal.getInstance(document.getElementById('editModal'));
        modalInstance.close(); // Close the modal after saving changes
    }).catch(error => {
        console.error('Error updating employee info', error);
    });
});

const renderEmployees = (doc) => {
    let li = document.createElement('li')
    li.className = "collection-item avatar"
    li.setAttribute("data-id", doc.id)
    li.setAttribute("id", doc.id)
    console.log(li)

    let name = document.createElement('span')
    name.className = "title"
    name.textContent = doc.data().employee_name;
    console.log(name)

    let description = document.createElement("p")
    description.className = "grey-text"
    description.textContent = doc.data().employee_description;
    console.log(description)

    let image = document.createElement("img")
    image.className = "circle"
    image.src = doc.data().employee_image;

    let iconContainer = document.createElement("div")
    iconContainer.className = "container secondary-content"

    let deleteIcon = document.createElement('i')
    deleteIcon.className = 'material-icons red-text secondary-content'
    deleteIcon.textContent = 'delete'

    deleteIcon.addEventListener('click', e => {
        e.stopPropagation();

        let id = e.target.parentElement.getAttribute('data-id')
        console.log('delete button clicked, deleted: ', id)

        deleteElementById(id)

        db.collection("employees").doc(id).delete()
    })

    let editIcon = document.createElement('i')
    editIcon.className = 'material-icons black-text'
    editIcon.textContent = 'create'

    editIcon.addEventListener('click', e => {
        e.stopPropagation();

        id = e.target.parentElement.getAttribute('data-id')
        console.log(id)

        document.getElementById('edit_employee_name').value = doc.data().employee_name
        document.getElementById('edit_employee_description').value = doc.data().employee_description
        document.getElementById('edit_employee_image').value = doc.data().employee_image

        const modalInstance = M.Modal.getInstance(document.getElementById('editModal'))
        modalInstance.open()
    })

    li.appendChild(image)
    li.appendChild(name)
    li.appendChild(description)
    li.appendChild(iconContainer)
    li.appendChild(editIcon)
    li.appendChild(deleteIcon)
    console.log(li)

    ul.appendChild(li)

    $(document).ready(function() {
        $('.modal').modal()
    })
}

window.onload = () => {
    console.log("app.js works")
}

db.collection("employees").orderBy("employee_name").onSnapshot(
    snapshot => {
        console.log(snapshot)
        let changes = snapshot.docChanges()
        changes.forEach(
            change => {
                console.log(change.type)
                console.log(change.doc.data())
                switch (change.type) {
                    case "added":
                        renderEmployees(change.doc)
                        break
                    case "modified":
                        let modifiedLi = document.querySelector(`[data-id="${change.doc.id}"]`)
                        modifiedLi.querySelector('.title').textContent = change.doc.data().employee_name
                        modifiedLi.querySelector('p').textContent = change.doc.data().employee_description
                        modifiedLi.querySelector('img').textContent = change.doc.data().employee_image
                        break
                    case "removed":
                        let li = document.querySelector(`[data-id="${change.doc.id}"]`)
                        ul.removeChild(li)
                        break
                    default:
                        console.log("Event not supported!, ", change.type)
                }
            }
        )
    }
)

document.getElementById('nameSearchInput').addEventListener('input', searchEmployeesByName)
document.getElementById('descSearchInput').addEventListener('input', searchEmployeesByDesc)
document.getElementById('sortByName').addEventListener('click', sortEmployeesByName)
document.getElementById('sortByDesc').addEventListener('click', sortEmployeesByDesc)

form.addEventListener("submit", e => {
    e.preventDefault()

    console.log("form submitted")

    db.collection("employees").add({
        employee_name: form.employee_name.value,
        employee_description: form.employee_description.value,
        employee_image: form.employee_image.value
    })
    form.employee_name.value = ''
    form.employee_description.value = ''
    form.employee_image.value = ''
})