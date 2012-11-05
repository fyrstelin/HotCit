import os, re
import json

def extractServer(lines):
    server, lines = lines[0].strip(), lines[1:]
    return server, lines
  
def extractKeysNames(lines):
    valid_json_lists = []
    for i, line in enumerate(lines):
        line = line.strip()
        if line and not line.startswith('%'):
            # first line that is not empty or a comment, should be keyword names
            keys = _prune_sp_tokens(line)
            keys = _commentify(keys)
            keys = _prune_endspaces(keys)

            try:
                keys = json.loads(keys)
                return keys, lines[i+1:]
            except ValueError:
                with open('error.txt', 'w') as f:
                    f.write(keys)
                print 'It seems the keywords could not be parsed as json, have a look at error.txt'
                print
                raise
                
    print 'could not find any keyword names'
    sys.exit(1)
      
      
def _extract_kwargs(test_values, keys):
    res = []
    kwargs = {}
    for i, value in enumerate(test_values):
        try:
            kwargs[keys[i].strip().replace(' ', '_')] = value
        except:
            print 'Something went wrong in combining a key with a value'
            print 'Might there be more values, than keys?'
            print 'I am looking for the', i, 'th key in', keys
            print 'and want to combine it with the value', value
            print
            raise
            
    return kwargs  
  
 
def extractTests(lines, keys):
    valid_json_lists = []
    for i, line in enumerate(lines):
        if line.strip().startswith('%') or not line.strip():
            continue
            
        valid_json = ''
        line = _prune_comments(line)
        line = _prune_sp_tokens(line)
        valid_json = _commentify(line)
        valid_json = _prune_endspaces(valid_json)
        
        try:
            values = json.loads(valid_json) # check to see if it parses as valid json
            test = _extract_kwargs(values, keys)
            valid_json_lists.append(test)
            
        except ValueError:
            print 'Something is wrong with the', i, 'testcase, it seems it is not valid json.'
            print 'have a look at error.txt'
            with open('error.txt', 'w') as f:
                f.write(valid_json)
            print
            raise
    return valid_json_lists    
    
def _prune_comments(raws):
    raw = ''
    for line in raws:
        match = line.find('%')
        if match != -1:
            raw += line[:match]
        else:
            raw += line

    return raw


def _prune_sp_tokens(fraw):
    return re.sub('[\t\s]+', ' ', fraw)


def _commentify(raw):
    '''
    inputs the " for the raw to be valid JSON,
    '''

    escaping = False
    search_wstart = True
    search_wend = False
    last_char = None
        
    formatted_raw = ''
    for char in raw:
        new_last_char = char
        
        if not char or char == ' ':
            pass
                
        elif char == '@':
            escaping = not escaping

        elif char != '@' and escaping:
            pass

        elif char == '[':
            search_wend = False
            search_wstart = True

        elif char == ']':
            if search_wend:
                char = '"' + char
            elif search_wstart:
                if last_char == ']' or last_char == '@':
                    pass
                else:
                    char = '""' + char

            search_wend = False
            search_wstart = True
            
        elif char == ',' :
            if last_char == ']':
                pass
            elif last_char == '@':
                pass
            elif search_wend:
                char = '"' + char
            elif search_wstart:
                char = '""' + char
            
            search_wend = False
            search_wstart = True

        elif search_wstart:
            char = '"' + char
              
            search_wstart = False
            search_wend = True


        formatted_raw += char
        if char != ' ':
            last_char = new_last_char
            
    return formatted_raw.replace('@','')   

def _prune_endspaces(raw):
    return re.sub('\s*",','",', raw) 
                    
# http://jsonlint.com/
def parse(path):
    '''
    if file contains a valid JSON list, except "",
    parse(filepath) returns an ordered list of keyword argument
    dicts using the first line in input list as keyword names,
    and the following as keyword values.

    everything to the right of the comment delim iter '%' is ignored

    the order of the columns is not significant

	www.google.dk
	[
	[description,         	method,     url,					statuscode],
	%-----------------------------------------------------------------------------------------------------------------------------------------------
	[GET GOOGLE TITTTIES, 	GET, 		/search?q=titties, 		200],
	[POST GOOGLE TITTTIES, 	POST, 		search?q=titties, 		411]
	]	

    '''

    with open(path, 'rb') as f:
        lines = f.readlines()
    
    server, lines = extractServer(lines)
    keys, lines = extractKeysNames(lines)
    tests = extractTests(lines, keys)
    return server, tests

    
if __name__ == '__main__':
    print parse('example.test')
