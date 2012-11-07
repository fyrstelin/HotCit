import httplib, urllib, json, base64
from test_parser import parse
import sys
from sys import argv

content_type = 'application/json'
accept = 'application/json'

def send_request(server, method, url, params, headers, debug=False):
    #auth_type = 'Basic'
    #password = 'secret'
    #auth_hash = username + ':' + password
    #user_info = base64.b64encode(auth_hash)


    #send request
    conn = httplib.HTTPConnection(server)

    if debug:
        conn.set_debuglevel(DEBUG)

    if params:
        params = json.dumps(params)
        
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

import re, ast
def assertEquals(value, expected, key):
    value = str(value).lower()
    expected = str(expected).lower()
       
    if value != expected:
        msg = "\n"
        msg += key[0].upper()+key[1:] + ':'
        msg += "\n\t"
        msg += "Expected".ljust(12) + ": %s" % expected
        msg += "\n\t"
        msg += "Actual".ljust(12) + ": %s" % value
        raise AssertExc(msg)
    

def run_test(testno, debug, server, description=None, username=None, password=None, url=None, reason=None, params=None, method='GET', statuscode=200, data=None):   

    #set headers
    headers = {}
    headers['Content-Type'] = content_type
    headers['Accept'] = accept
    if username: headers['Authorization'] = username
    
    (rstatus, rreason, rdata) = send_request(server, method, url, params, headers, debug)
    
    if data:
         # hack to get rid of keys encoded in unicode =/
         # and to get all keys sorted in the same order
         # and to get rid of all sugar spaces

        try:
            data = json.dumps(data)
        except:
            pass
            
    if rdata:
        try:
            rdata = json.dumps(json.loads(rdata))
        except:
            pass
        
    print 'TEST', testno, ':', description.ljust(20),':', 
    try:
        if statuscode:  assertEquals(int(rstatus), int(statuscode), 'statuscode')
        if reason:      assertEquals(rreason, reason, 'reason')
        if data:        assertEquals(rdata, data, 'data')
        print '\tCHECK'
        return True
    
    except AssertExc as e:
        print '\tERROR'
        response = ''
        response += e.message + '\n'
        response += '\n'
        response += 'Uri: %s' % method + '  ' + server+url + '\n'
        response += '\n'
        if headers:
            response += 'Headers:' + '\n'
            for key, value in headers.iteritems():
                response += '\t' + key + ': ' + value + '\n'
        response += '\n'
        if params:
            response += 'Params:' + '\n'
            for key, value in params.iteritems():
                response += '\t' + key + ':' + json.dumps(value) + '\n'
        
        response += '\n'
        if rdata:
            response += 'Content body:' + '\n'
            try:
                rdata = json.loads(rdata)
            except:
                pass
                
            if isinstance(rdata,dict):
                for key, value in rdata.iteritems():
                    response += '\t' + key + ':' + json.dumps(value) + '\n'
            else:
                response += '\t' + rdata
        
        print response
        with open('error.txt', 'w') as f:
            f.write(response)
        print
        print 'error written to error.txt'
        return False

            
if __name__ == '__main__':

    
    if len(argv) < 2:
        print 'you\'re doing it wrong sir. I need a file to parse as input...'
        sys.exit(1)

    if len(argv) > 2:
        debug_testno = argv[2:]
        print debug_testno
    else:
        debug_testno = [-1]
    
    path = argv[1]
    server, tests = parse(path)

    tlength = len(tests)
    
    print
    print 'Executing %d tests using %s' % (tlength, server)

    completed = 0
    for i, test in enumerate(tests):
        i += 1
        print '-'*80

        debug = True if str(i) in debug_testno or '*' in debug_testno else False 

        if debug:
            print
            print 'DEBUGMODE ENABLED', '*'*80
            for key, value in test.iteritems():
                print key, ' = ', value

        success = run_test(i, debug, server, **test)

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

    
