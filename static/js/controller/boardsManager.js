import {dataHandler} from "../data/dataHandler.js";
import {htmlFactory, htmlTemplates} from "../view/htmlFactory.js";
import {domManager} from "../view/domManager.js";
import {cardsManager} from "./cardsManager.js";

let isDropOverDiv = false
export let boardsManager = {

  loadBoards: async function () {
    document.getElementById("navbar-buttons").innerHTML = ""
    let navbarContent = "1"
    if (localStorage.getItem('login')) {
        const navbarBuilder = htmlFactory(htmlTemplates.loggedNavbar)
        navbarContent = navbarBuilder()
    }
    else {
        const navbarBuilder = htmlFactory(htmlTemplates.logoutNavbar)
        navbarContent = navbarBuilder()
    }
    domManager.addChild("#navbar-buttons", navbarContent)
    domManager.addEventListener(`#create-board-button`,
          "click",
          openNewBoardModal
    );
    domManager.addEventListener("#refresh_page",
       "click",
        dataHandler.reloadBoards
    );
    domManager.addEventListener("#form-board",
          "submit",
          dataHandler.createNewBoard
    );
    domManager.addEventListener("#form-card",
        "submit",
        dataHandler.createNewCard
    );
    domManager.addEventListener(`#login-button`,
          "click",
          openLoginModal
      );
      domManager.addEventListener(`#register-button`,
          "click",
          openRegisterModal
      );
    domManager.addEventListener("#login-form",
        "submit",
        dataHandler.loginUser
    );
    domManager.addEventListener("#register-form",
        "submit",
        dataHandler.registerUser
    );
    domManager.addEventListener("#board-title",
        "click",
        removeNotValidStyle
    );
    domManager.addEventListener("#card-title",
        "click",
        removeNotValidStyle
    );
    domManager.addEventListener("#email-login",
        "click",
        removeNotValidStyle
    );
    domManager.addEventListener("#password-login",
        "click",
        removeNotValidStyle
    );
    domManager.addEventListener("#email-register",
        "click",
        removeNotValidStyle
    );
    domManager.addEventListener("#password-register",
        "click",
        removeNotValidStyle
    );
    domManager.addEventListener("#logout",
        "click",
        logout
    );
    let boards = await dataHandler.getPublicBoards();
    if (localStorage.getItem('login')) {
        let owner = localStorage.getItem('login')
        boards = await dataHandler.getBoards(owner);
    }
    for (let board of boards) {
      const boardBuilder = htmlFactory(htmlTemplates.board);
      const content = boardBuilder(board);
      domManager.addChild("#root", content);
      if (board.owner !== null) {
          let header = document.querySelector(`#header-Row[data-board-id="${board.id}"]`)
          header.classList.add("private_board")
      }
      if (localStorage.getItem(board.id) === 'open') {
          await cardsManager.loadCards(board.id)
      }
      domManager.addEventListener(
        `#showContent[data-board-id="${board.id}"]`,
        "click",
        showHideButtonHandler
      );
      domManager.addEventListener(`#add-card[data-board-id="${board.id}"]`,
          "click",
          openNewCardModal
      );
      domManager.addEventListener(
          `#deleteBoardButton[data-board-id="${board.id}"]`,
          "click",
          deleteBoardButtonHandler
      );
      domManager.addEventListener(
        `#archived-cards-button[data-board-id="${board.id}"]`,
          "click",
          openArchiveCardsModal
      );
      domManager.addEventListener(
          `#content-row-container[data-board-id="${board.id}"]`,
        "drop",
        handleDrop
      );
      domManager.addEventListener(
        `#content-row-container[data-board-id="${board.id}"]`,
        "dragover",
        handleDragOver
      );
      domManager.addEventListener(
        `#content-row-container[data-board-id="${board.id}"]`,
        "dragenter",
        handleDragEnter
      );
      domManager.addEventListener(
         `#board-title[data-board-id="${board.id}"]`,
                "dblclick",
                changeNameOfBoard
            );
       domManager.addEventListener(
                `#add-column[data-board-id="${board.id}"]`,
                "click",
                dataHandler.createNewColumn
            );
      domManager.addEventListener(
        `#content-row-container[data-board-id="${board.id}"]`,
        "dragleave",
        handleDragLeave
      );
      domManager.addEventListener(
          `#board-title[data-board-id="${board.id}"]`,
          "dblclick",
          changeNameOfBoard
      )
    }
  },
};

function openRegisterModal(e) {
    e.preventDefault()
    const registerForm = document.getElementById("register-form")
    const loginForm = document.getElementById("login-form")
    const registerModal = document.getElementById("registerModal")
    loginForm.hidden = true
    registerForm.hidden = false
    $(registerModal).modal()
}

function openLoginModal(e) {
    e.preventDefault()
    const registerForm = document.getElementById("register-form")
    const loginForm = document.getElementById("login-form")
    const registerModal = document.getElementById("registerModal")
    registerForm.hidden = true
    loginForm.hidden = false
    $(registerModal).modal()
}

function showHideButtonHandler(clickEvent) {
    const boardId = clickEvent.target.dataset.boardId;
    const element = document.querySelector(`#showContent[data-board-id='${boardId}']`);
    const contentToHide = document.querySelector(`#content-row-container[data-board-id="${boardId}"]`);
    const statusesToHide = document.querySelector(`#statuses-row-container[data-board-id="${boardId}"]`);
    const addCardButton = document.querySelector(`#add-card[data-board-id="${boardId}"]`);
    const archiveCardButton = document.querySelector(`#archived-cards-button[data-board-id="${boardId}"]`);
    const addColumnButton = document.querySelector(`#add-column[data-board-id="${boardId}"]`);
    if (element.innerHTML === "<i class=\"bi bi-chevron-double-down\"></i> Show") {
        localStorage.setItem(boardId, 'open')
        cardsManager.loadCards(boardId).then();
        addCardButton.parentNode.hidden = false;
        archiveCardButton.parentNode.hidden = false;
        addColumnButton.parentNode.hidden = false
        element.innerHTML = "<i class=\"bi bi-chevron-double-up\"></i> Hide";
    } else {
        localStorage.setItem(boardId, 'close')
        addCardButton.parentNode.hidden = true
        contentToHide.hidden = true
        addColumnButton.parentNode.hidden = true
        archiveCardButton.parentNode.hidden = true;
        contentToHide.innerHTML = ""
        statusesToHide.innerHTML = ""
        element.innerHTML = "<i class=\"bi bi-chevron-double-down\"></i> Show"
    }
}

function deleteBoardButtonHandler(clickEvent) {
    const boardId = clickEvent.target.dataset.boardId;
    const rowsToDelete = document.getElementsByClassName('row' && 'bg-light');
    for (let row of rowsToDelete) {
        let rowId = row.getAttribute('data-board-id');
        if (rowId === boardId) {
            row.parentElement.remove();
            dataHandler.deleteBoard(boardId).then();
        }
    }
}


function handleDragOver(e) {
    e.preventDefault();
    if (!isDropOverDiv) {
        isDropOverDiv = true
        if (e.target.id !== "content-columns-container" && e.target.id !== "content-row-container" && e.target.id !== "deleteCardButton") {
            e.target.insertAdjacentHTML("afterend", `<div id="drop-over">&nbsp</div>`);
        }
    }
}

function handleDragEnter(e) {
}

function handleDragLeave() {
    if (isDropOverDiv) {
        isDropOverDiv = false
        let div = document.getElementById("drop-over");
        if (div) {
            div.remove()
        }
    }
}

function handleDrop(e) {
    e.preventDefault();
    let div = document.getElementById("drop-over");
    div.parentNode.insertBefore(cardsManager.dragItem, div);
    let status_id = div.parentNode.getAttribute("data-column-id");
    let board_id = div.parentNode.getAttribute("data-board-id");
    let card_order = null
    if (div.nextSibling) {
        card_order = div.nextSibling.getAttribute("data-cardorder-id");
    } else {
        card_order = parseInt(div.previousSibling.getAttribute("data-cardorder-id")) + 1;
    }
    let card_id = cardsManager.dragItem.getAttribute("data-card-id");
    let data = {"status_id": status_id, "card_order": card_order, "board_id": board_id}
    dataHandler.changeStatus(card_id, data).then();
    div.remove();
    cardsManager.dragItem = null;
}


function openNewBoardModal() {
    let newBoardModal = document.getElementById("new-board-modal")
    let newCardForm = document.getElementById("form-card")
    let newBoardForm = document.getElementById("form-board")
    let modalTitle = document.getElementById("exampleModalLabel")
    let inputModal = document.getElementById("board-title")
    let checkboxPrivate = document.getElementById('is-logged"')
    newBoardForm.hidden = false
    newCardForm.hidden = true
    modalTitle.style.color = "black"
    modalTitle.innerHTML = "Create new board"
    inputModal.classList.remove("not_valid")
    inputModal.value = ""
    if (localStorage.getItem('login')) {
        checkboxPrivate.innerHTML = `<input type="checkbox" value="isPrivate" id="private" name="private">
                            <label for="private">private</label>`
    }
    $(newBoardModal).modal();
}

function openNewCardModal(e) {
    let newCardModal = document.getElementById("new-board-modal")
    let newCardForm = document.getElementById("form-card")
    let newBoardForm = document.getElementById("form-board")
    let modalTitle = document.getElementById("exampleModalLabel")
    let inputModal = document.getElementById("card-title")
    let boardId = e.target.dataset.boardId;
    newCardForm.setAttribute("data-board-id", boardId)
    newCardForm.hidden = false
    newBoardForm.hidden = true
    modalTitle.style.color = "black"
    modalTitle.innerHTML = "Create new card"
    inputModal.classList.remove("not_valid")
    inputModal.value = ""
    $(newCardModal).modal();
}

async function openArchiveCardsModal(e) {
    let boardId = e.target.dataset.boardId;
    let cardsContainer = document.getElementById("archived-cards-container");
    while (cardsContainer.firstChild) {
        cardsContainer.removeChild(cardsContainer.firstChild);
    }
    let archivedCardsModal = document.getElementById("archived-cards-modal");
    let archivedCards = await dataHandler.getArchivedCardsByBoard(boardId);
    for (let cardData of archivedCards) {
        let card = `<div style="margin-bottom: 2vh" id="archived-card-${cardData.id}">
                        <div class="row">
                        <div class="col cards border border-success rounded" style="margin-left: 1vh; margin-right: 1vh;">${cardData.title}</div>
                        </div>
                        <div class="row">
                        <div class="col">
                            <button type="button" class="btn btn-light btn-sm" id="restore-button" data-card-id=${cardData.id}>Restore</button>
                            <button type="button" style="margin-right: 1vh;" class="btn btn-light btn-sm" id="delete-button" data-card-id=${cardData.id}>Delete</button>
                        </div>
                        </div>
                        </div>
                  `;
        domManager.addChild("#archived-cards-container", card)
        domManager.addEventListener(`#restore-button[data-card-id="${cardData.id}"]`,
            "click",
            cardsManager.restoreArchivedCard)
        domManager.addEventListener(`#delete-button[data-card-id="${cardData.id}"]`,
            "click",
            cardsManager.deleteCardButtonHandler)
    }
    $(archivedCardsModal).modal();
}

function removeNotValidStyle() {
    let fieldToRemoveStyle = document.getElementById("board-title")
    let fieldToRemoveStyle1 = document.getElementById("card-title")
    let fieldToRemoveStyle2 = document.getElementById("password-login")
    let fieldToRemoveStyle3 = document.getElementById("email-login")
    let fieldToRemoveStyle4 = document.getElementById("password-register")
    let fieldToRemoveStyle5 = document.getElementById("email-register")
    fieldToRemoveStyle.classList.remove("not_valid")
    fieldToRemoveStyle1.classList.remove("not_valid")
    fieldToRemoveStyle2.classList.remove("not_valid")
    fieldToRemoveStyle3.classList.remove("not_valid")
    fieldToRemoveStyle4.classList.remove("not_valid")
    fieldToRemoveStyle5.classList.remove("not_valid")
}

function logout(e) {
    e.preventDefault()
    dataHandler.logout(e).then()
}

function changeNameOfBoard(e) {
    let card_id = e.target.getAttribute("data-board-id")
    let previousInput = e.target.innerText
    let isSave = false
    e.target.innerHTML = `<div><input id="change-title" name="title" value="${previousInput}"></div>`

    document.getElementById('change-title').addEventListener("keypress", function (eve) {
        if (eve.key === 'Enter') {
            let title = eve.target.value
            dataHandler.changeBoardName(card_id, {'title': title}).then()
            isSave = true
            document.activeElement.blur()
        }
    })
    document.getElementById('change-title').addEventListener("focusout", function (eve) {
        let title = eve.target.value
        if (!isSave) {
            e.target.innerHTML = `${previousInput}`
        } else {
            e.target.innerHTML = `${title}`
        }
    })
}
