import httplib, urllib, json, base64
import unittest
from test_parser import parse


content_type = 'application/json'
accept = 'application/json'


def send_request(server, method, username, url, params):
    #auth_type = 'Basic'
    #password = 'secret'
    #auth_hash = username + ':' + password
    #user_info = base64.b64encode(auth_hash)

    if params:
        params = json.dumps(params)

    #set headers
    headers = {}
    if content_type: headers['Content-Type'] = content_type
    if username: headers['Authorization'] = username
    if accept: headers['Accept'] = accept

    #send request
    conn = httplib.HTTPConnection(server)
    conn.request(method, url, params, headers)
    res = conn.getresponse()
    conn.close()

    # parse response 
    status = res.status
    reason = res.reason
    data = res.read()


    return (status, reason, data)


class AssertExc(Exception):
    pass


def assertEquals(value, expected, key):
    if (value) != str(expected):
        msg = 'expected %s to be %s, not %s' % (key, expected, value)
        raise AssertExc(msg)
    

def run_test(testno, server, description=None, username=None, password=None, url=None, reason=None, params=None, method='GET', statuscode=200, data=None):   
    (rstatus, rreason, rdata) = send_request(server, method, username, url, params)
    
    print 'TEST', testno, ':', description.ljust(20),':', 
    try:
        if statuscode:  assertEquals(statuscode, rstatus, 'statuscode')
        if reason:      assertEquals(reason, rreason, 'reason')
        if data:        assertEquals(data, rdata, 'data')
        print '\tCHECK'
        return True
    
    except AssertExc as e:
        print '\tERROR'
        print e.message
        return False

            
if __name__ == '__main__':
    import sys
    from sys import argv
    
    if len(argv) < 2:
        print 'you\'re doing it wrong sir. I need a file to parse as input...'
        sys.exit(1)
    
    path = argv[1]
    server, tests = parse(path)

    tlength = len(tests)
    
    print
    print 'Executing %d tests using %s' % (tlength, server)

    completed = 0
    for i, test in enumerate(tests):
        i += 1
        
        #for key, value in test.iteritems():
        #    print key, ' = ', value

        print '-'*80 
        success = run_test(i, server, **test)

        if not success:
            break
        else:
            completed += 1


    print '-'*80
    print
    if completed != tlength: 
        print 'Suite failed after completing %d/%d tests' % (completed, tlength)

    else:
        print 'Suite finished. %d/%d tests succeeded.' % (completed, tlength)

    
