import {boardsManager} from "../controller/boardsManager.js";


export let dataHandler = {
    getBoards: async function (boardOwner) {
        return await apiGet(`/api/boards/${boardOwner}`);
    },
    getPublicBoards: async function () {
        return await apiGet("/api/public/boards")
    },

    getStatusesByBoardId: async function (boardId) {
        return await apiGet(`/api/statuses/${boardId}`);
    },
    getCardsByBoardId: async function (boardId) {
        return await apiGet(`/api/boards/${boardId}/cards/`);
    },
    getCard: async function (cardId) {
        return await apiGet(`/api/card/${cardId}`)
    },
    getArchivedCardsByBoard: async function (boardId) {
        return await apiGet(`/api/boards/${boardId}/archived-cards/`);
    },
    deleteBoard: async function (boardId) {
        await apiDelete(`/api/boards/${boardId}`);
    },
    updateArchiveCardStatus: async function (cardId, data) {
        await apiPut(`/api/boards/cards/archive/${cardId}`, data);
    },
    deleteCard: async function (cardId) {
        await apiDelete(`/api/boards/cards/${cardId}`);
    },
    createNewBoard: async function (e) {
        e.preventDefault()
        let title = document.getElementById("board-title")
        let isPrivate = document.getElementById('private')
        let owner = null
        if (isPrivate.checked) {
            owner = localStorage.getItem('login')
        }
        let boardHeader = document.getElementById("exampleModalLabel")
        const form = e.currentTarget
        const url = form.action;
        if (!title.value) {
            title.classList.add("not_valid")
            return;
        }
        try {
            let data = {"title": title.value, "owner": owner}
            await apiPost(url, data)
                .then(() => {
                    document.getElementById("form-board").hidden = true
                    boardHeader.innerHTML = "Successfully added board <i class=\"bi bi-check2-all\"></i>"
                    boardHeader.style.color = "#FF5A5F"
                    setTimeout(function () {
                        dataHandler.reloadBoards();
                    }, 1000);
                });
        } catch (error) {
            console.log(error);
        }
    },
    reloadBoards: async function () {
        let page = document.getElementById("root")
        let modal = document.getElementById("new-board-modal")
        page.innerHTML = ""
        $(modal).modal('hide')
        await boardsManager.loadBoards()
    },

    createNewCard: async function (e) {
        e.preventDefault()
        let title = document.getElementById("card-title")
        let cardHeader = document.getElementById("exampleModalLabel")
        const form = e.currentTarget
        let boardId = form.getAttribute("data-board-id")
        const url = form.action;
        let formData = {"cardTitle": title.value, "boardId": boardId}
        if (!title.value) {
            title.classList.add("not_valid")
            return;
        }
        try {
            await apiPost(url, formData)
                .then(() => {
                    document.getElementById("form-card").hidden = true
                    cardHeader.innerHTML = "successfully added card <i class=\"bi bi-check2-all\"></i>"
                    cardHeader.style.color = "#FF5A5F"

                    setTimeout(function () {
                        dataHandler.reloadBoards();
                    }, 1000);

                });
        } catch (error) {
            console.log(error);
        }
    },

    createNewColumn: async function (e) {
        e.preventDefault()
        const board = e.currentTarget
        let boardId = board.getAttribute("data-board-id")
        const url = "/api/boards/columns";
        let data = {"boardId": boardId}
        if(localStorage.getItem("change-title")==="False") {
            try {
                await apiPost(url, data)
                    .then(() => {
                        localStorage.setItem("change-title", "True")
                        dataHandler.reloadBoards()

                    });
            } catch (error) {
                console.log(error);
            }
        }
    },

    loginUser: async function (e) {
        e.preventDefault()
        let email = document.getElementById("email-login")
        let password = document.getElementById("password-login")
        let formData = {"email": email.value, "password": password.value}
        let url = document.getElementById("login-form").action
        let informationModal = document.getElementById("information-modal")
        let notValidInputInfo = document.getElementById("not_valid_info_login")
        let loginModal = document.getElementById("registerModal")
        let registerInfo = document.getElementById("register-info")
        notValidInputInfo.hidden = true
        if (!(email.value)) {
            email.classList.add("not_valid")
            return;
        }
        if (!(password.value)) {
            password.classList.add("not_valid")
            return;
        }
        try {
            await apiPost(url, formData)
                .then((res) => {
                    localStorage.setItem('login', res[1])
                    if (!res[0]) {
                        notValidInputInfo.hidden = false
                    }
                    else {
                        $(loginModal).modal('hide')
                        registerInfo.innerHTML = "Successfully logged in"
                        $(informationModal).modal()
                        notValidInputInfo.hidden = true
                        document.getElementById("navbar-buttons").innerHTML = ""
                        dataHandler.reloadBoards()
                        document.getElementById("register-header").innerHTML = `Signed in as ${res[1]}`

                    }
                });
        } catch (error) {
            console.log(error);
        }
    },
    registerUser: async function (e) {
        e.preventDefault()
        let email = document.getElementById("email-register")
        let password = document.getElementById("password-register")
        let formData = {"email": email.value, "password": password.value}
        let url = document.getElementById("register-form").action
        let registerModal = document.getElementById("registerModal")
        let informationModal = document.getElementById("information-modal")
        let notValidInputInfo = document.getElementById("not_valid_info_register")
        let registerInfo = document.getElementById("register-info")
        notValidInputInfo.hidden = true
        if (!(email.value)) {
            email.classList.add("not_valid")
            return;
        }
        if (!(password.value)) {
            password.classList.add("not_valid")
            return;
        }
        try {
            await apiPost(url, formData)
                .then((res) => {
                    if (res) {
                        $(registerModal).modal('hide');
                        registerInfo.innerHTML = "Signed Up successfully"
                        $(informationModal).modal();
                        notValidInputInfo.hidden = true
                    }
                    else {
                        notValidInputInfo.hidden = false
                    }
                });
        } catch (error) {
            console.log(error);
        }

    },
    logout: async function(e) {
        e.preventDefault()

        await apiGet(`/api/logout`)
            .then(() => {
                localStorage.removeItem('login')
                document.getElementById("navbar-buttons").innerHTML = ""
                dataHandler.reloadBoards()

        })
    },
    changeStatus: async function (cardId, data) {
        await apiPut(`/api/boards/cards/${cardId}`, data)
    },
    changeCardName: async function (cardId, data) {
        await apiPut(`/api/boards/cards/name/${cardId}`, data)
    },
    changeBoardName: async function (boardId, data) {
        await apiPut(`/api/boards/name/${boardId}`, data)
    },
    changeColumnName: async function (columnId, data) {
        await apiPut(`/api/boards/columns/name/${columnId}`, data)
    },
    deleteColumns: async function (columnId) {
        await apiDelete(`/api/statuses/${columnId}`).then(()=>{
            dataHandler.reloadBoards()
        })
    }
};

async function apiGet(url) {
    let response = await fetch(url, {
        method: "GET",
    });
    if (response.status === 200) {
        return response.json();
    }
}

async function apiPost(url, data) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    return response.json();
}

async function apiDelete(url) {
    return fetch(url, {
        method: "DELETE"
    });
}

async function apiPut(url, data) {
    return fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
}
