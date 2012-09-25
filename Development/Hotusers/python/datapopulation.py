import os, random, urllib
from passgenerator import generate
from randomDate import randomDate

GAMES_insert = 'INSERT INTO GAMES (name) VALUES(?)'
USERS_insert = 'INSERT INTO USERS (name, email, hpass, salt) VALUES(?,?,?,?)'
RESULTS_insert = 'INSERT INTO RESULTS (gid, uid, tmsp, rid, noPlayers) VALUES(?, ?, ?, ?, ?)'


names = ['turing', 'babbage', 'shannon', 'ada', 'nygaard', 'testrup', 'glistrup', 'mogensen', 'nyrup', 'fogh']
pids = xrange(1, len(names)+1)
gids = xrange(1,5) #hack

def generateUsersData(names):
    values = []
    for name in names:
        password = generate(12)
        salt = repr(random.randint(1000000000000000, 9999999999999999))
        hpass = ((password+salt).encode('base64','strict'))
        email = '%s@cs.au.dk' % name
        value = (name, email, hpass, salt)
        values.append(value)

    return values


def generateALotOfGameResults(no):
    results = []

    for i in range(no):
        noPlayers = random.randint(2, 7)        
        players = random.sample(pids, noPlayers)
        winner = random.sample(players, 1)[0]
        tmsp = randomDate("1/1/2008 1:30 PM", "1/1/2009 4:50 AM", random.random())
        gid = random.sample(gids, 1)[0]

        for uid in players:
            rid = 1 if uid == winner else -1
            result = (gid, uid, tmsp, rid, noPlayers)
            results.append(result)

    return results;
    

if __name__ == '__main__':
    import sqlite3
    
    db_src = '../databases/hotusers_simple.sqlite'
    print 'populating: ', db_src

    conn = sqlite3.connect(db_src)
    c = conn.cursor()

    users = generateUsersData(names)
    for user in users:
        c.execute(USERS_insert, user) 

    results = generateALotOfGameResults(20)
    for result in results:
        c.execute(RESULTS_insert, result)
    
    conn.commit()
    c.close()

    print 'done'
