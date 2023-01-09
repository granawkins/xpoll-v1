import time
from collections import Counter, defaultdict
import networkx as nx

class PollGraph:
    def __init__(self, path=None):
        """Initialize an empty graph

        TODO: Load from path"""
        self.G = nx.DiGraph()

    def get_users(self):
        """Return list of all usernames"""
        return [n for n, d in self.G.nodes(data=True) if d['node_type'] == 'user']

    def get_poll_ids(self):
        return [n for n, d in self.G.nodes(data=True) if d['node_type'] == 'poll']

    def feed(self, username=None, sort_by='new', page=1, results_per_page=10):
        """Return list of all poll_ids"""
        if sort_by == 'new':
            _polls = [(n, data['timestamp']) for n, data in self.G.nodes(data=True)
                      if data['node_type'] == 'poll']
        elif sort_by == 'top':
            _polls = [(n, self.G.in_degree(n)) for n, data in self.G.nodes(data=True)
                      if data['node_type'] == 'poll']
        else:
            raise ValueError(f'Unrecognized sort_by: {sort_by}')
        _sorted = sorted(_polls, key=lambda p: p[1], reverse=True)
        i_start = results_per_page * (page - 1)
        if i_start > len(_sorted) - 1:
            return []
        i_end = min(i_start + results_per_page, len(_sorted))
        response = [self.get_poll(poll_id, username)
                    for poll_id, _ in _sorted[i_start:i_end]]
        return response

    def add_user(self, username):
        """Add a username to the graph

        Raises
            AssertionError: username already exists
        """
        assert not self.G.has_node(username), 'Username already exists'

        self.G.add_node(
            username,
            node_type='user',
        )

    def add_poll(self, username, question, answers):
        """Add a poll to the graph

        Raises
            AssertionError: username not recognized
            AssertionError: question or answers format incorrect
        """
        assert self.G.has_node(username), f"Username not recognized: {username}"
        assert isinstance(question, str), f"Question must be a string"
        assert (isinstance(answers, list) and
                len(answers) > 0 and
                all(isinstance(o, str) for o in answers)), f"Answers must be a list of strings"

        poll_id = hex(abs(hash(''.join([username, question, str(answers)]))))[:10]
        self.G.add_node(
            poll_id,
            node_type='poll',
            author=username,
            question=question,
            answers=answers,
            timestamp=time.time(),
        )
        return poll_id

    def vote(self, username, poll_id, answer_id):
        """Vote by adding an edge from username to poll_id with answer_id

        Raises:
            AssertionError: unnrecognized username or poll_id
            AssertionError: already voted
        """
        assert self.G.has_node(username), f'Unrecognized username: {username}'
        assert self.G.has_node(poll_id), f'Unrecognized poll_id: {poll_id}'
        assert not self.G.has_edge(username, poll_id), f'{username} has already voted'
        answers = dict(self.G.nodes[poll_id])['answers']
        assert 0 <= answer_id <= (len(answers) - 1)

        self.G.add_edge(username, poll_id, answer=answer_id)

    def get_poll(self, poll_id, username=None, filters=None):
        """Return the text, author, votes and (if already voted) results"""
        assert self.G.has_node(poll_id), f'Unrecognized poll_id: {poll_id}'
        poll = self.G.nodes[poll_id]
        response = dict(poll)
        response['poll_id'] = poll_id
        response['votes'] = self.G.in_degree(poll_id)
        if not self.G.has_edge(username, poll_id):
            return response

        response['user_answer'] = self.G.edges[username, poll_id]['answer']
        if filters is None:
            votes = [data['answer']
                        for _from, _to, data in self.G.in_edges(poll_id, data=True)]
            tallied = dict(Counter(votes))
            results = [tallied.get(i, 0) for i in range(len(poll['answers']))]
            response['results'] = results

        else:
            voters = set(self.G.predecessors(poll_id))
            for filter_id, answer in filters.items():
                assert self.G.has_edge(username, filter_id)
                filter_voters = set(v for v in self.G.predecessors(filter_id)
                                    if self.G.edges[v, filter_id]['answer'] == answer)
                voters = voters.intersection(filter_voters)
            response['votes'] = len(voters)
            votes = [data['answer']
                     for _from, _to, data in self.G.in_edges(poll_id, data=True)
                     if _from in voters]
            tallied = dict(Counter(votes))
            results = [tallied.get(i, 0) for i in range(len(poll['answers']))]
            response['results'] = results

        return response


    def get_related_polls(self, poll_id, filters=None, ignore=None, page=1, results_per_page=10):
        """Return a dict of connected poll_ids and the number of edges in common"""
        """Return list of all poll_ids"""
        ignore = set() if ignore is None else set(ignore)
        ignore.add(poll_id)
        voters = self.G.predecessors(poll_id)
        if filters is not None:
            voters = set(voters)
            for filter_id, answer in filters.items():
                filter_voters = set(v for v in self.G.predecessors(filter_id)
                                    if self.G.edges[v, filter_id]['answer'] == answer)
                voters = voters.intersection(filter_voters)

        related = Counter()
        for voter in voters:
            for _poll in self.G.successors(voter):
                if _poll not in ignore:
                    related.update({_poll: 1})
        response = []
        i_start = (page - 1) * results_per_page
        i_polls = 0
        for _poll, count in related.most_common():
            i_polls += 1
            if i_polls < i_start:
                continue
            elif len(response) >= results_per_page:
                break
            poll_data = {
                'poll_id': _poll,
                'question': self.G.nodes[_poll]['question'],
                'votes': count
            }
            response.append(poll_data)

        return response


    def get_crossed_poll(self, username, source_id, cross_id, filters=None):
        """Return the results"""

        # Prepare response text
        cross = self.get_poll(cross_id, username)
        source = self.get_poll(source_id, username)
        response = {
            **cross,
            'source_id': source['poll_id'],
            'source_question': source['question'],
            'source_answers': source['answers'],
        }
        # Get the list of eligible voters
        voters = set(self.G.predecessors(source_id))
        if filters is not None:
            for filter_id, answer in filters.items():
                filter_voters = set(v for v in self.G.predecessors(filter_id)
                                    if self.G.edges[v, filter_id]['answer'] == answer)
                voters = voters.intersection(filter_voters)
        cross_voters = set(v for v in self.G.predecessors(cross_id))
        voters = set.intersection(voters, cross_voters)
        response['votes'] = len(voters)

        # Calculate results
        crossed_votes = defaultdict(Counter)
        for voter in voters:
            source_vote = self.G.get_edge_data(voter, source_id)['answer']
            cross_vote = self.G.get_edge_data(voter, cross_id)['answer']
            crossed_votes[source_vote].update({cross_vote: 1})
        results = [[0 for _ in range(len(source['answers']))]
                   for _ in range(len(cross['answers']))]
        for i, s in enumerate(results):
            for j in range(len(s)):
                results[i][j] = crossed_votes[j][i]
        response['results'] = results

        return response
