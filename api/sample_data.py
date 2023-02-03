USERS = ['Alice', 'Bob', 'Carol', 'Daniel', 'Eleanor', 'Fabian', 'Grant',
         'Ina', 'Janet', 'Kay', 'Long', 'Mary', 'Neal', 'Owen', 'Phuong Anh',
         'Quan', 'Randi', 'Seth', 'Tanya', 'Ursula', 'Van', 'Wang', 'Xuan',
         'Yanni', 'Zack']

POLLS = [
    {'question': 'Which decade where you born in?',
     'answers': ['2010s or after', '2000s', '1990s', '1980s', '1970s', '1960s', '1950s or before']},  # 1. AGE
    {'question': 'What is your sex?',
     'answers': ['Male', 'Female', 'Other']},  # 2. SEX
    {'question': 'Where were you born?',
     'answers': ['North America', 'South America', 'Europe', 'Africa', 'Asia', 'Australia']},  # 3. BIRTHPLACE
    {'question': 'Where were you currently live?',
     'answers': ['North America', 'South America', 'Europe', 'Africa', 'Asia', 'Australia']},  # 4. RESIDENCE
    {'question': 'What is your first/primary language?',
     'answers': ['English', 'Chinese', 'Hindi', 'Spanish', 'French', 'Arabic', 'Other']},  # 5. LANGUAGE
    {'question': 'What is the highest level of education you have completed?',
     'answers': ['Primary School', 'High School', 'Vocational/Trade School',
                 'Associate Degree (2yr)', "Bachelor's Degree (4yr)", "Master's or PhD"]},  # 6. EDUCATION
    {'question': 'What is your occupation?',
     'answers': ['Professional', 'Managerial/Administrative', 'Sales/Customer Service',
                 'Education/Training', 'Artistic/Creative', 'Manual labor/Trades', 'Other/Not employed']},  # 7. OCCUPATION
    {'question': 'What is your current annual income? (USD equivalent)',
     'answers': ['Less than $10,000', '$10,000-$25,000', '$25,000-$75,000', '$75,000-$150,000', 'More than $150,000']},  # 8. INCOME
    {'question': 'Which of the following best describes your ethnicity?',
     'answers': ['African', 'Asian', 'Caucasian/White', 'Hispanic/Latino', 'Native American/Indigenous', 'Mixed', 'Other']},  # 9. ETHNICITY
    {'question': 'What is your religion?',
     'answers': ['Christianity', 'Islam', 'Hinduism', 'Buddhism', 'Atheist', 'Other', 'Agnostic/None']},  # 10. RELIGION
    {'question': 'Which of the following best describes your political beliefs?',
     'answers': ['Conservative', 'Liberal', 'Libertarian', 'Socialist', 'Green/Environmental', 'Moderate', 'Other']},  # 11. POLITICS
]

import numpy as np

def add_samples(G, n_voters=26):
    """Load sample data into PollGraph object"""

    # Add Users
    rng = np.random.default_rng()
    for i in range(n_voters):
        first_name = USERS[i % len(USERS)]
        last_name = rng.choice([l for l in 'abcdefghijklmnopqrstuvwxyz'], 10)
        last_name = str(''.join([l for l in last_name])).capitalize()
        G.add_user(f'{first_name} {last_name}')

    # Add Polls
    users = G.get_users()
    for i, poll in enumerate(POLLS):
        author = rng.choice(users)
        G.add_poll(author, POLLS[i]['question'], POLLS[i]['answers'])

    # Vote
    poll_ids = G.get_poll_ids()
    for i, voter in enumerate(users):
        n_votes = rng.integers(0, len(poll_ids))
        vote_on_poll = rng.choice(poll_ids, n_votes, replace=False)
        for poll_id in vote_on_poll:
            answer_id = rng.integers(0, len(G.G.nodes[poll_id]['answers']))
            G.vote(voter, poll_id, int(answer_id))
    return G

