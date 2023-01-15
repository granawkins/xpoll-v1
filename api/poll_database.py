import json
from collections import Counter
import numpy as np
from neo4j import GraphDatabase
from sample_data import USERS, POLLS

URI = "bolt://localhost:7687"
USER = "neo4j"
PASSWORD = "password"

class PollDatabase:

    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def refresh(self):
        def _refresh(tx):
            tx.run('MATCH ()-[r:VOTE]->() DELETE r')
            tx.run('MATCH (n) DELETE n')
        with self.driver.session() as session:
            session.execute_write(_refresh)

    # ---------------------------- USER MANAGEMENT ----------------------------
    def user_exists(self, username, session=None):
        def _user_exists(tx, username):
            result = tx.run("MATCH (n:User) "
                            "WHERE n.name = $username "
                            "RETURN n.name IS NOT NULL as exists", username=username)
            return False if result is None else any(r['exists'] for r in result)
        if session is not None:
            res = session.execute_read(_user_exists, username)
        with self.driver.session() as session:
            res = session.execute_read(_user_exists, username)
        return res

    def add_user(self, username):
        """Add username to database, return new user element"""
        if self.user_exists(username):
            raise ValueError(f'Username ({username}) is already in use')
        def _add_user(tx, username):
            # Add and return user
            result = tx.run("CREATE (u:User {name: $username}) RETURN u.name", username=username)
            return result.single()[0]
        with self.driver.session() as session:
            res = session.execute_write(_add_user, username)
            return res

    def remove_user(self, username=None):
        """Remove all instances of a username or id"""
        def _remove_user(tx, username):
            relationships = tx.run("MATCH (n:User {name: $username})-[r:VOTE]->(p:Poll) "
                                   "DELETE r", username=username)
            result = tx.run("MATCH (n:User) WHERE n.name = $username "
                            "DELETE n RETURN true as success", username=username)
            res = result.single()
            return False if res is None else res[0]
        with self.driver.session() as session:
            res = session.execute_write(_remove_user, username)
            return res

    def get_users(self, page=1, items_per_page=10):
        """Return a list of all usernames"""
        def _get_users(tx, skip, limit):
            result = tx.run("MATCH (n:User) RETURN n.name AS name "
                            "SKIP $skip LIMIT $limit", skip=skip, limit=limit)
            return [r['name'] for r in result]
        skip = (page - 1) * items_per_page
        with self.driver.session() as session:
            res = session.execute_read(_get_users, skip, items_per_page)
            return res

    # ---------------------------- POLL MANAGEMENT ----------------------------
    @staticmethod
    def get_poll_id(author, question, answers):
        return hex(abs(hash(''.join([author, question, str(answers)]))))[2:12]

    def poll_exists(self, poll_id, session=None):
        def _poll_exists(tx, poll_id):
            result = tx.run("MATCH (n:Poll) "
                            "WHERE n.poll_id = $poll_id "
                            "RETURN n.poll_id IS NOT NULL as exists", poll_id=poll_id)
            return False if result is None else any(r['exists'] for r in result)
        if session is not None:
            res = session.execute_read(_poll_exists, poll_id)
        with self.driver.session() as session:
            res = session.execute_read(_poll_exists, poll_id)
        return res

    def add_poll(self, author, question, answers):
        """Add a poll to the graph"""
        if not self.user_exists(author):
            raise ValueError(f'Unrecognized user: {author}')
        poll_id = self.get_poll_id(author, question, answers)
        if self.poll_exists(poll_id):
            raise ValueError(f'A poll with id {poll_id} already exists.')
        def _add_poll(tx, author, question, answers):
            ans = json.dumps(answers)
            result = tx.run("CREATE (p:Poll {poll_id: $poll_id, "
                           "author: $author, question: $question, "
                           "answers: $answers}) RETURN p",
                           poll_id=poll_id, author=author, question=question,
                           answers=ans)
            res = result.single()[0]
            if res is None:
                raise ValueError('Failed to add new poll to database.')
            res = dict(res)
            res['answers'] = json.loads(res['answers'])
            return res
        with self.driver.session() as session:
            res = session.execute_write(_add_poll, author, question, answers)
            return res

    def remove_poll(self, poll_id):
        """Remove a poll from the graph"""
        def _remove_poll(tx, poll_id):
            relationships = tx.run("MATCH (p:Poll {poll_id: $poll_id})<-[r:VOTE]-(u:User) "
                                   "DELETE r", poll_id=poll_id)
            result = tx.run("MATCH (p:Poll) "
                            "WHERE p.poll_id = $poll_id "
                            "DELETE p RETURN true as success", poll_id=poll_id)
            res = result.single()
            return False if res is None else res[0]
        with self.driver.session() as session:
            res = session.execute_write(_remove_poll, poll_id)
            return res

    def get_poll_ids(self, page=1, items_per_page=10):
        """Return a list of poll_ids and questions"""
        def _get_poll_ids(tx, skip, limit):
            result = tx.run("MATCH (p:Poll) "
                            "RETURN p.poll_id as poll_id "
                            "SKIP $skip LIMIT $limit", skip=skip, limit=limit)
            return [r['poll_id'] for r in result]
        skip = (page - 1) * items_per_page
        with self.driver.session() as session:
            res = session.execute_read(_get_poll_ids, skip, items_per_page)
            return res

    def get_poll(self, poll_id, username=None, filters=None):
        def _get_poll(tx, poll_id):
            # Poll Data
            result = tx.run("MATCH (p:Poll) WHERE p.poll_id = $poll_id RETURN p", poll_id=poll_id)
            response = dict(result.single()[0])
            response['answers'] = json.loads(response['answers'])
            # Vote Count
            result = tx.run("MATCH (p:Poll {poll_id: $poll_id})<-[r:VOTE]-() "
                            "RETURN count(r) as count", poll_id=poll_id)
            response['votes'] = int(result.single()['count'])
            # User Answer
            user_answer = tx.run("MATCH (u:User)-[r:VOTE]->(p:Poll) "
                                 "WHERE u.name = $username AND p.poll_id = $poll_id "
                                 "RETURN r.answer as answer", username=username, poll_id=poll_id)
            u = user_answer.single()
            if u is None:
                return response
            response['user_answer'] = int(u['answer'])
            # Tally Votes
            if filters is None:
                votes = tx.run("MATCH (p:Poll {poll_id: $poll_id})<-[r:VOTE]-() "
                               "RETURN r.answer as answer", poll_id=poll_id)
            else:
                # Filter votes
                match_query = "MATCH (u:User)-[r:VOTE]->(p:Poll)"
                where_query = " WHERE p.poll_id = $poll_id"
                kwargs = {'poll_id': poll_id}
                for i, (filter_id, answer) in enumerate(filters.items()):
                    match_query += f", (u)-[r{i}:VOTE]->(f{i}:Poll)"
                    where_query += f' AND r{i}.answer = $answer{i} AND f{i}.poll_id = $filter{i}'
                    kwargs[f'answer{i}'] = answer
                    kwargs[f'filter{i}'] = filter_id
                query = match_query + where_query + " RETURN r.answer as answer"
                votes = tx.run(query, kwargs)

            votes = [r['answer'] for r in votes]
            response['votes'] = len(votes)
            tallied = dict(Counter(votes))
            results = [tallied.get(i, 0) for i in range(len(response['answers']))]
            response['results'] = results
            return response

        with self.driver.session() as session:
            res = session.execute_read(_get_poll, poll_id)
            return res

    # ---------------------------- VOTE ----------------------------
    def vote_exists(self, user, poll_id, session=None):
        def _vote_exists(tx, user, poll_id):
            result = tx.run("MATCH (u:User {name: $user})-[v:VOTE]->(p:Poll {poll_id: $poll_id}) "
                            "RETURN COUNT(v) > 0", user=user, poll_id=poll_id)
            res = result.single()
            return None if res is None else res[0]
        if session is not None:
            res = session.execute_read(_vote_exists, user, poll_id)
        with self.driver.session() as session:
            res = session.execute_read(_vote_exists, user, poll_id)
        return res

    def vote(self, user, poll_id, answer):
        def _vote(tx, user, poll_id, answer):
            result = tx.run("MATCH (u:User {name: $name}), "
                            "(p:Poll {poll_id: $poll_id}) "
                            "CREATE (u)-[r:VOTE {answer: $answer}]->(p) "
                            "RETURN u.name as user, p.poll_id as poll_id, r.answer as answer",
                            name=user, poll_id=poll_id, answer=answer)
            return dict(result.single())
        with self.driver.session() as session:
            if not self.user_exists(user, session=session):
                raise ValueError(f'User not found: {user}')
            elif not self.poll_exists(poll_id, session=session):
                raise ValueError(f'Poll not found: {poll_id}')
            elif self.vote_exists(user, poll_id, session=session):
                raise ValueError(f'User ({user}) has already voted on poll ({poll_id})')
            res = session.execute_write(_vote, user, poll_id, answer)
            return res

if __name__ == '__main__':
    pd = PollDatabase(URI, USER, PASSWORD)

    pd.refresh()

    for u in USERS:
        pd.add_user(u)
    users = pd.get_users(items_per_page=100)
    print(users)

    for i, p in enumerate(POLLS):
        i_author = i % len(USERS)
        author = USERS[i_author]
        try:
            poll = pd.add_poll(author, p['question'], p['answers'])
            # print(poll)
        except Exception as e:
            print(e)

    poll_ids = pd.get_poll_ids(items_per_page=100)
    polls = {p: pd.get_poll(p, username=users[0]) for p in poll_ids}

    rng = np.random.default_rng()
    for i, voter in enumerate(users):
        n_votes = len(poll_ids) #rng.integers(5, len(poll_ids))
        vote_on_poll = rng.choice(poll_ids, n_votes, replace=False)
        for poll_id in vote_on_poll:
            answer_id = rng.integers(0, len(polls[poll_id]['answers']))
            vote = pd.vote(voter, poll_id, int(answer_id))
        print(f'{voter}: {len(vote_on_poll)} votes')
    polls = {p: pd.get_poll(p) for p in poll_ids}

    for i, poll_id in enumerate(poll_ids):
        base_votes = polls[poll_id]['votes']
        filter_id = rng.choice(poll_ids)
        filtered_poll = pd.get_poll(poll_id, username=users[0], filters={filter_id: 0})
        if filtered_poll is None:
            continue
        filtered_votes = filtered_poll['votes']
        print(f'Poll {poll_id} base votes: {base_votes}, filtered by {filter_id} votes: {filtered_votes}')
        break

    pd.close()
