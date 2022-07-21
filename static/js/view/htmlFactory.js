export const htmlTemplates = {
    board: 1,
    card: 2,
    column: 3,
    loggedNavbar: 4,
    logoutNavbar: 5

}

export function htmlFactory(template) {
    switch (template) {
        case htmlTemplates.board:
            return boardBuilder
        case htmlTemplates.card:
            return cardBuilder
        case htmlTemplates.column:
            return columnBuilder
        case htmlTemplates.logoutNavbar:
            return navbarLogoutBuilder
        case htmlTemplates.loggedNavbar:
            return navbarLoggedBuilder
        default:
            console.error("Undefined template: " + template)
            return () => {
                return ""
            }
    }
}

function openedBoardContent(board) {
    return ` <div class="container">
  <div class="row bg-light" id="header-Row" data-board-id="${board.id}">
      <div class="col h3 margin_header" id="board-title" data-board-id="${board.id}">${board.title}
    </div>
    <div class="col-md-auto margin_header mr-0"><button type="button" data-board-id="${board.id}" class="btn btn-outline-dark btn-sm" id="add-card">+ Add Card</button>
    </div>
    <div class="col-md-auto margin_header mr-0 p-0"><button type="button" data-board-id="${board.id}" class="btn btn-outline-dark btn-sm" id="archived-cards-button">Archived cards</button></div>
    <div class="col-md-auto margin_header mr-0"><button type="button" data-board-id="${board.id}" class="btn btn-outline-dark btn-sm" id="add-column">+ Add Column</button></div>
      <div class="col-md-auto margin_header mr-0 p-0"><button type="button" class="btn btn-outline-dark btn-sm" id="showContent" data-board-id="${board.id}"><i class="bi bi-chevron-double-up"></i> Hide</button>
    </div>
    <div class="col-md-auto margin_header">
    <i id="deleteBoardButton" data-board-id="${board.id}" class="bi bi-trash"></i>
    </div>
  </div> 
  <div class="row" data-board-id="${board.id}" id ="statuses-row-container">
  </div>
  <div class="row" data-board-id="${board.id}" id="content-row-container">
</div>
  </div>`;
}

function closedBoardContent(board) {
    return ` <div class="container">
  <div class="row bg-light" id="header-Row" data-board-id="${board.id}">
      <div class="col h3 margin_header" id="board-title" data-board-id="${board.id}">${board.title}</i>
    </div>
    <div class="col-md-auto margin_header mr-0" hidden><button type="button" data-board-id="${board.id}" class="btn btn-outline-dark btn-sm" id="add-card">+ Add Card</button></div>
    <div class="col-md-auto margin_header mr-0" hidden><button type="button" data-board-id="${board.id}" class="btn btn-outline-dark btn-sm" id="archived-cards-button">Archived cards</button></div>
    <div class="col-md-auto margin_header mr-0" hidden><button type="button" data-board-id="${board.id}" class="btn btn-outline-dark btn-sm" id="add-column">+ Add Columns</button></div>
    <div class="col-md-auto margin_header mr-0 p-0"><button type="button" class="btn btn-outline-dark btn-sm" id="showContent" data-board-id="${board.id}"><i class="bi bi-chevron-double-down"></i> Show</button></div>
    <div class="col-md-auto margin_header">
    <i id="deleteBoardButton" data-board-id="${board.id}" class="bi bi-trash"></i>
    </div>
  </div> 
  <div class="row" data-board-id="${board.id}" id ="statuses-row-container" hidden>
  </div>
  <div class="row" data-board-id="${board.id}" id="content-row-container" hidden>
</div>
  </div>`;
}

function boardBuilder(board) {
    if (localStorage.getItem(board.id) === 'open') {
        return openedBoardContent(board)
    } else {
        return closedBoardContent(board)
    }
}

function cardBuilder(card) {
    return `<div draggable="true" data-card-id="${card.id}" data-cardorder-id="${card.card_order}" class="cards border border-success rounded">
                ${card.title}
                <i id="archiveCardButton" style="float:right;margin-right: 1vh" data-card-id="${card.id}" class="bi bi-archive" hidden></i>
            </div>`;
}
function columnBuilder(column, boardId) {
    document.querySelector(`#statuses-row-container[data-board-id='${boardId}']`).hidden = false
    document.querySelector(`#content-row-container[data-board-id='${boardId}']`).hidden = false
    if (column.title) {
        localStorage.setItem("change-title", "False")
        return [`<div class="col border-right border-dark" style="background-color: #566DBA" data-column-id="${column.id}" data-board-id="${boardId}">
     <i id="deleteColumnButton" style="float:right;margin-right: -1.2vh;" class="bi bi-x-circle" data-column-id=${column.id}></i>
     <div id="status-title" data-column-id="${column.id}">${column.title}</div>
    </div>`, `<div class = "col rounded m-2 p-2 d-flex flex-column" data-column-id="${column.id}" id="content-columns-container" data-board-id="${boardId}"><div class="empty">&nbsp</div></div>`];
    } else {
        localStorage.setItem("change-title", "True")
        return [`<div class="col border-right border-dark" style="background-color: #566DBA" data-column-id="${column.id}" data-board-id="${boardId}">
     <i id="deleteColumnButton" style="float:right;margin-right: -1.2vh;" class="bi bi-x-circle" data-column-id=${column.id}></i>
     <div id="status-title" data-column-id="${column.id}"><div><input id="change-title" name="title" value="" autofocus></div></div>
    </div>`, `<div class = "col rounded m-2 p-2 d-flex flex-column" data-column-id="${column.id}" id="content-columns-container" data-board-id="${boardId}"><div class="empty">&nbsp</div></div>`];
    }
}

function navbarLoggedBuilder() {
    let login = localStorage.getItem("login")
    return `<li class="nav-item ml-3">
          <a class="nav-link navbar-btn border border-secondary rounded" id="create-board-button" style="background-color: whitesmoke">
                New Board
          </a>
        </li>
        <li class="nav-item ml-3">
          <a class="nav-link border border-secondary rounded" id="logout" href="/api/logout" style="background-color: whitesmoke">
              Log Out
          </a>
        </li>
      <li class="nav-item ml-3">
              <a class="nav-link navbar-btn" id="register-header" style="color: white">Signed in as ${login}</a>
        </li>`
}

function navbarLogoutBuilder() {
    return `
        <li class="nav-item ml-3">
          <a class="nav-link border border-secondary rounded" href="/login" id="login-button" style="background-color: whitesmoke">
              Sign In 
            </a>
        </li>
      <li class="nav-item ml-3">
              <a class="nav-link navbar-btn border-secondary rounded" href="/register" id="register-button" style="background-color: whitesmoke">
              Sign Up</a>
        </li>`
}

