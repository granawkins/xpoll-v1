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

def add_samples(G):
    """Load sample data into PollGraph object"""
    for user in USERS:
        G.add_user(user)
    for i, poll in enumerate(POLLS):
        i_user = i % len(USERS)
        G.add_poll(USERS[i_user], POLLS[i]['question'], POLLS[i]['answers'])
    poll_ids = G.get_poll_ids()
    for i, voter in enumerate(USERS):
        n_votes = 3 if i % 2 > 0 else 5
        for j, poll_id in enumerate(poll_ids[:n_votes]):
            answer_id = i % (len(POLLS[j]['answers']))
            G.vote(voter, poll_id, answer_id)
    return G

