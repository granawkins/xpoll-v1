import math
from poll_graph import PollGraph
from sample_data import POLLS, USERS

def test_poll_graph():
    pg = PollGraph()

    # Add/get User
    for user in USERS:
        pg.add_user(user)
    users = pg.get_users()
    assert users == USERS

    # Add/get Polls
    for i, poll in enumerate(POLLS):
        i_user = i % len(USERS)
        pg.add_poll(USERS[i_user], poll['question'], poll['answers'])
    poll_ids = pg.get_poll_ids()
    assert len(poll_ids) == len(POLLS)
    first_poll = pg.get_poll(poll_ids[0])
    assert isinstance(first_poll['timestamp'], float)
    del first_poll['timestamp']
    assert first_poll == {
        'node_type': 'poll',
        'poll_id': poll_ids[0],
        'author': USERS[0],
        'question': POLLS[0]['question'],
        'answers': POLLS[0]['answers'],
        'votes': 0,
    }

    # Feed
    feed_new = pg.feed(USERS[-1], sort_by='new')
    assert feed_new[0]['question'] == POLLS[-1]['question']
    feed_top = pg.feed(USERS[-1], sort_by='top')
    assert feed_top[0]['question'] == POLLS[0]['question']

    # Vote
    for i, voter in enumerate(USERS):
        n_votes = 3 if i % 2 > 0 else 5
        for poll_id in poll_ids[:n_votes]:
            poll = pg.get_poll(poll_id)
            answer_id = i % len(poll['answers'])
            pg.vote(voter, poll_id, answer_id)

    second_poll = pg.get_poll(poll_ids[1], USERS[0])
    assert second_poll['votes'] == len(USERS)
    assert len(second_poll['results']) == len(second_poll['answers'])
    assert sum(second_poll['results']) == len(USERS)

    # Related
    related_polls = pg.get_related_polls(poll_ids[1])
    expected = {'poll_id', 'question', 'votes'}
    for poll in related_polls:
        assert set(poll.keys()) == expected
        assert all(poll[k] is not None for k in expected)

    # # Cross
    # crossed_results = pg.get_crossed_poll(poll_ids[1], poll_ids[2])
    # assert crossed_results == {
    #     'source_question': POLLS[1]['question'],
    #     'source_answers': POLLS[1]['answers'],
    #     'cross_question': POLLS[2]['question'],
    #     'cross_answers': POLLS[2]['answers'],
    #     'results': [
    #         [1, 0, 1],
    #         [1, 1, 0],
    #         [0, 1, 1],
    #         [0, 0, 0],
    #     ]
    # }
