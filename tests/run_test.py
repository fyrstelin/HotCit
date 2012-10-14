import httplib, urllib, json, base64
import unittest
from test_parser import parse

timeout = 10
port = 53998
server = "localhost"
content_type = 'application/json'
accept = 'application/json'

def send_request(method, username, url, params): 
    #auth_type = 'Basic'
    #password = 'secret'
    #auth_hash = username + ':' + password
    #user_info = base64.b64encode(auth_hash)

    if params:
        params = json.dumps(params)

    #set headers
    headers = {}
    headers['Content-Type'] = content_type
    headers['Authorization'] = username
    headers['Accept'] = accept


    #send request
    conn = httplib.HTTPConnection(server, port, timeout)
    conn.request(method, url, params, headers)
    res = conn.getresponse()
    conn.close()

    # parse response 
    status = res.status
    reason = res.reason
    data = res.read()


    return {
                'status':str(status),
                'reason':reason,
                'data':data,
            }

def create_test(testno, description, username, password, url, params, method, statuscode, reason, data):
    def test(self):
        response = send_request(method, username, url, params)
        print '-'*80 
        print 'test', testno, ':', description,
        try:
            if statuscode:  self.assertEqual(statuscode, response.get('status'))
            if reason:      self.assertEqual(reason, response.get('reason'))
            print '\tCHECK'
        except:
            print '\tERROR'
            print '-'*80
            raise

        finally:
            print '-'*80

    return test

            
if __name__ == '__main__':
    from sys import argv
    if len(argv) > 1:
        path = argv[1]
        del argv[1]
    
        tests = parse(path)

        class Example(unittest.TestCase):
            pass
        
        for i, test in enumerate(tests):
            i += 1
            test_method = create_test(i, **test)
            setattr(Example, 'test '+str(i), test_method) 

        unittest.main(exit=False, verbosity=0)
