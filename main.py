import mimetypes
from dotenv import load_dotenv
from flask import Flask, render_template, url_for, session, request, jsonify
import queires
import util
from util import json_response
import os


mimetypes.add_type('application/javascript', '.js')
app = Flask(__name__)
load_dotenv()
app.secret_key = os.urandom(24).hex()


@app.route("/")
def index():
    return render_template('index.html')


@app.route("/api/boards/<board_owner>")
@json_response
def get_boards(board_owner):
    return queires.get_boards(board_owner)


@app.route("/api/boards/<int:board_id>/cards/")
@json_response
def get_cards_for_board(board_id: int):
    return queires.get_cards_for_board(board_id)


@app.route("/api/card/<int:card_id>")
@json_response
def get_card(card_id: int):
    return queires.get_card(card_id)


@app.route("/api/boards/<int:board_id>/archived-cards/")
@json_response
def get_archived_cards_by_board(board_id: int):
    return queires.get_archived_cards(board_id)


@app.route("/api/boards/<int:board_id>", methods=["DELETE"])
@json_response
def delete_board(board_id: int):
    queires.delete_cards_by_board(board_id)
    queires.delete_status_by_board(board_id)
    queires.delete_board(board_id)


@app.route("/api/boards/cards/archive/<int:card_id>", methods=["PUT"])
@json_response
def change_archive_card_status(card_id: int):
    archived_status = request.get_json()["archived_status"]
    queires.change_archive_card_status(card_id, archived_status)


@app.route("/api/boards/cards/<int:card_id>", methods=["DELETE", "PUT"])
@json_response
def delete_card_from_board(card_id: int):
    if request.method == "DELETE":
        queires.delete_card(card_id)
    elif request.method == "PUT":
        status_id = request.get_json()["status_id"]
        board_id = request.get_json()["board_id"]
        card_order = request.get_json()["card_order"]
        queires.change_card_order(card_order, board_id)
        queires.change_card_status(card_id, status_id, card_order)


@app.route("/api/boards/cards/name/<int:card_id>", methods=["PUT"])
@json_response
def change_cards_name(card_id: int):
    title = request.get_json()["title"]
    queires.change_card_name(card_id, title)


@app.route("/api/boards/name/<int:board_id>", methods=["PUT"])
@json_response
def change_boards_name(board_id: int):
    title = request.get_json()["title"]
    queires.change_board_name(board_id, title)


@app.route("/api/boards/", methods=["POST"])
@json_response
def create_new_board():
    board_title = request.get_json()['title']
    board_owner = request.get_json()['owner']
    new_board_id = queires.add_new_board(board_title, board_owner)
    queires.add_new_column("new", new_board_id)
    queires.add_new_column("in progress", new_board_id)
    queires.add_new_column("testing", new_board_id)
    queires.add_new_column("done", new_board_id)


@app.route("/api/boards/cards", methods=["POST"])
@json_response
def create_new_card():
    card_title = request.get_json()["cardTitle"]
    board_id = request.get_json()["boardId"]
    card_order = queires.find_last_card_in_board_by_order(board_id)[0]['order']
    status_id = queires.get_status_id(board_id)[0]['id']
    if not card_order:
        card_order = 1
    queires.add_new_card(card_title, board_id, card_order, status_id)


@app.route("/api/boards/columns", methods=["POST"])
@json_response
def create_new_column():
    column_title = None
    board_id = request.get_json()["boardId"]
    queires.add_new_column(column_title, board_id)


@app.route("/api/boards/columns/name/<column_id>", methods=["PUT"])
@json_response
def change_column_name(column_id):
    column_title = request.get_json()["title"]
    queires.change_column_name(column_title, column_id)


@app.route("/api/statuses/<board_id>", methods=["GET", "DELETE"])
@json_response
def get_statuses_for_board(board_id):
    if request.method == "DELETE":
        queires.delete_card_by_status(board_id)
        queires.delete_status(board_id)
    else:
        return queires.get_statuses_for_board(board_id)


def main():
    app.run(debug=True)
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


@app.route("/api/public/boards")
@json_response
def get_public_boards():
    return queires.public_boards()


@app.route('/api/register/user', methods=['POST'])
@json_response
def register():
    json = request.get_json()
    if not queires.check_if_user_in_database(json['email']):
        email = json['email']
        password = util.hash_password(json['password'])
        queires.save_user(email, password)
        username_taken = True
        response = username_taken
        return response
    else:
        username_taken = False
        response = username_taken
        return response


@app.route('/api/login/user', methods=['POST'])
@json_response
def login():
    json = request.get_json()
    if queires.check_if_user_in_database(json['email']):
        password = json['password']
        saved_password = queires.get_password_by_email(json['email'])[0]['password']
        if util.verify_password(password, saved_password):
            user = json['email']
            username = user.split('@')
            user_id = queires.find_user_id_by_email(user)
            session['id'] = user_id[0]['id']
            session['user'] = user
            session['username'] = username[0]
            login_success = True
            return login_success, username[0]
        else:
            login_success = False
            return login_success
    else:
        login_success = False
        return login_success


@app.route("/api/logout")
def logout():
    session.pop("id", None)
    session.pop("user", None)
    return jsonify()


if __name__ == '__main__':
    main()
