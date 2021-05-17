class JiraApp {
  constructor() {
    this.idForLists = 2;
    this.idForItems = 2;
  }
  addEventOnAddList() {
    let buttonElement = document.getElementById("add-list-button");
    buttonElement.addEventListener("click", () => {
      let inputElement = buttonElement.previousElementSibling;
      let value = inputElement.value;
      inputElement.value = "";
      if (value != "") this.addListToCollection(value);
    });
  }

  addListToCollection(listName) {
    let id = this.idForLists;
    let ret = this.getListHtml(listName);
    this.setListHtmlToCollection(ret);
    this.addEventOnEditButton(id);
    this.addEventOnAddJira(id);
    this.idForLists += 1;
  }

  setListHtmlToCollection(ret) {
    let element = document.createElement("div");
    element.innerHTML = ret;
    document
      .getElementById("list-collection")
      .append(element.firstElementChild);
  }

  getListHtml(listName) {
    let id = this.idForLists;
    let listHtml = `
    <section id="list${id}" class="list">
        <section class="list-name">
        <h2>${listName}</h2>
        <button class="edit-button" id="edit-button${id}">Edit</button>
        </section>

        <section id="add-jira" class="add-jira">
          <input type="text" placeholder="Enter title for Jira" />
          <textarea
            cols="30"
            rows="3"
            placeholder="enter Descripton"
          ></textarea>
          <button id="add-jira${id}">Add Jira</button>
        </section>

        <section id="list-item-container${id}" class="list-item-container container"></section>
    </section>
      `;
    return listHtml;
  }

  addEventOnEditButton(id) {
    let element = document.getElementById("edit-button" + id);
    element.addEventListener("click", () => {
      let listNameElement = element.previousElementSibling;
      let listName = listNameElement.innerText;
      let editHtmlBox = `
      <textarea cols="30" rows="1" value="${listName}" focus=true></textarea>
      <button class="set-button" id="set-button${id}">Set Name</button>
      `;
      element.parentNode.innerHTML = editHtmlBox;
      this.addEventOnSetButton(id);
    });
    this.draggableCode();
  }

  addEventOnSetButton(id) {
    let element = document.getElementById("set-button" + id);
    element.addEventListener("click", () => {
      let listNameElement = element.previousElementSibling;
      let listName = listNameElement.value;
      let editHtmlBox = `
      <h2>${listName}</h2>
      <button class="edit-button" id="edit-button${id}">Edit</button>
      `;
      element.parentNode.innerHTML = editHtmlBox;
      this.addEventOnEditButton(id);
    });
  }

  addEventOnAddJira(id) {
    let element = document.getElementById("add-jira" + id);
    element.addEventListener("click", () => {
      let titleElement = element.previousElementSibling.previousElementSibling;
      let bodyElement = element.previousElementSibling;
      let id = this.idForItems;
      this.idForItems += 1;
      let jiraHtml = this.getHtmlForJira({
        title: titleElement.value,
        body: bodyElement.value,
        id: id,
      });
      bodyElement.value = "";
      titleElement.value = "";
      let listContainerElement = element.parentElement.nextElementSibling;
      this.addElementToJiraList(listContainerElement, jiraHtml);
      this.addEditJiraEvent(id);
      this.addDeleteEvent(id);
    });
  }

  getHtmlForJira({ title, body, id }) {
    let jiraHtml = `
    <div id="list-item${id}" class="list-item draggable" draggable=true>
    <h2>${title}</h2>
    <p>${body}</p>
    <p>
    <button id="edit-jira${id}">Edit</button>&nbsp;
    <button id="delete-jira${id}">Delete</button>
    </p>
    </div>
      `;
    return jiraHtml;
  }

  addElementToJiraList(listContainerElement, jiraHtml) {
    listContainerElement.innerHTML += jiraHtml;
    this.draggableCode();
  }

  addEditJiraEvent(id) {
    let element = document.getElementById("edit-jira" + id);
    element.addEventListener("click", () => {
      let parentDiv = element.parentElement.parentNode;
      let title = parentDiv.firstElementChild.innerText;
      parentDiv.firstElementChild.remove();
      let content = parentDiv.firstElementChild.innerText;
      parentDiv.firstElementChild.remove();
      let editDeleteButton = parentDiv.firstElementChild;
      parentDiv.firstElementChild.remove();
      let editHtml = `
      <input type="text" placeholder="Enter title for Jira" value="${title}"/>
      <textarea
        cols="20"
        rows="3"
        placeholder="enter Descripton"
      > ${content}</textarea>
      <button id="add-edited-jira${id}">Add Jira</button>
      `;
      let editElement = this.createElementFromHtml(editHtml);
      //parentDiv.prepend([...editElement].reverse());
      [...editElement].reverse().forEach((element) => {
        parentDiv.prepend(element);
      });
      parentDiv.lastElementChild.addEventListener("click", () => {
        this.addEventOnEditAddButton(parentDiv, parentDiv.lastElementChild, id);
      });
    });
  }

  createElementFromHtml(html) {
    let div = document.createElement("div");
    div.innerHTML = html;
    return div.children;
  }

  addEventOnEditAddButton(parentDiv, editElement, id) {
    let title = parentDiv.firstElementChild.value;
    parentDiv.firstElementChild.remove();
    let body = parentDiv.firstElementChild.value;
    parentDiv.firstElementChild.remove();
    parentDiv.firstElementChild.remove();
    let html = this.getHtmlForJira({ title, body, id });
    let elementArray = this.createElementFromHtml(html);
    [...elementArray[0].children].forEach((element) => {
      parentDiv.append(element);
    });
    this.addEditJiraEvent(id);
    this.addDeleteEvent(id);
    this.draggableCode();
  }

  addDeleteEvent(id) {
    let element = document
      .getElementById("delete-jira" + id)
      .addEventListener("click", () => {
        document.getElementById("list-item" + id).remove();
      });
  }

  draggableCode() {
    let containers = document.getElementsByClassName("container");
    let draggables = document.getElementsByClassName("draggable");

    [...draggables].forEach((draggable) => {
      draggable.addEventListener("dragstart", () => {
        console.log("dragging");
        draggable.classList.add("dragging");
      });

      draggable.addEventListener("dragend", () =>
        draggable.classList.remove("dragging")
      );
    });

    [...containers].forEach((container) => {
      container.addEventListener("dragover", (e) => {
        e.preventDefault();
        let draggingElement = document.getElementsByClassName("dragging")[0];
        let closeElement = this.getClosestElement(e.clientY, container);
        if (closeElement == null) container.append(draggingElement);
        else {
          container.insertBefore(draggingElement, closeElement);
        }
      });
    });
  }

  getClosestElement(y, container) {
    let draggables = container.querySelectorAll(".draggable:not(.dragging)");
    return [...draggables].reduce(
      (closest, draggable) => {
        let boxDimensions = draggable.getBoundingClientRect();
        let distance = y - (boxDimensions.top + boxDimensions.height / 2);
        if (distance < 0 && closest.distance < distance) {
          return {
            distance: distance,
            element: draggable,
          };
        }
        return closest;
      },
      { distance: Number.NEGATIVE_INFINITY, element: null }
    ).element;
  }
}

window.onload = () => {
  let jira = new JiraApp();
  jira.addEventOnAddList();
};
