# Import flask and datetime module for showing date and time
from flask import Flask, request, make_response

from poll_graph import PollGraph
from test_poll_graph import USERS, POLLS
from sample_data import add_samples

# Initializing flask app
app = Flask(__name__)
pg = PollGraph()
TEST_MODE = True
if TEST_MODE:
    pg = add_samples(pg)


@app.route('/get_users', methods=['GET'])
def get_users():
    users = pg.get_users()
    return make_response(users)


@app.route('/get_poll', methods=['POST'])
def get_poll():
    data = request.get_json()
    args = [data['poll_id']]
    kwargs = {k: data[k] for k in ('username', 'filters') if k in data}
    try:
        poll = pg.get_poll(*args, **kwargs)
        return make_response({'successful': True, 'error': None, 'data': poll})
    except AssertionError as e:
        return make_response({'successful': False, 'error': str(e)})


@app.route('/add_user', methods=['POST'])
def add_user():
    data = request.get_json()
    try:
        pg.add_user(data['username'])
        return make_response({'successful': True, 'error': None})
    except AssertionError as e:
        return make_response({'successful': False, 'error': str(e)})


@app.route('/add_poll', methods=['POST'])
def add_poll():
    data = request.get_json()
    try:
        pg.add_poll(data['username'], data['question'], data['answers'])
        return make_response({'successful': True, 'error': None})
    except AssertionError as e:
        return make_response({'successful': False, 'error': e})


@app.route('/vote', methods=['POST'])
def vote():
    data = request.get_json()
    print(dict(data))
    try:
        pg.vote(data['username'], data['poll_id'], data['answer_id'])
        poll_data = pg.get_poll(data['poll_id'], username=data['username'])
        return make_response({'successful': True, 'error': None, 'data': poll_data})
    except AssertionError as e:
        return make_response({'successful': False, 'error': e})


@app.route('/feed', methods=['POST'])
def feed():
    data = request.get_json()
    username = data.get('username', None)
    sort_by = data.get('sort_by', 'top')
    page = data.get('page', 1)
    try:
        feed = pg.feed(username, sort_by, page)
        return make_response({'successful': True, 'error': None, 'data': feed})
    except AssertionError as e:
        return make_response({'successful': False, 'error': e, 'data': None})


@app.route('/get_related_polls', methods=['POST'])
def get_related_polls():
    data = request.get_json()
    poll_id = data['poll_id']
    kwargs = {k: data[k] for k in {'ignore', 'filters', 'page', 'results_per_page'}
              if k in data}
    try:
        related = pg.get_related_polls(poll_id, **kwargs)
        return make_response({'successful': True, 'error': None, 'data': related})
    except AssertionError as e:
        return make_response({'successful': False, 'error': e, 'data': None})


@app.route('/get_crossed_poll', methods=['POST'])
def get_crossed_poll():
    data = request.get_json()
    args = [data.get(k) for k in ('username', 'source_id', 'cross_id')]
    kwargs = {k: data.get(k, None) for k in {'filters'}}
    try:
        crossed = pg.get_crossed_poll(*args, **kwargs)
        return make_response({'successful': True, 'error': None, 'data': crossed})
    except AssertionError as e:
        return make_response({'successful': False, 'error': e, 'data': None})


# Running app
if __name__ == '__main__':
    app.run(debug=True)
