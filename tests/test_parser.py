import os, simplejson as json

# http://jsonlint.com/
def parse(path):
    '''
    if file contains a valid JSON list, except "",
    parse(filepath) returns an ordered list of keyword argument
    dicts using the first line in input list as keyword names,
    and the following as keyword values.

    everything to the right of the comment delim iter '%' is ignored

    the order of the columns is not significant

    [
        [description,         method,      uri,              data,          username, password,		expected statuscode,  	reason],
        %-----------------------------------------------------------------------------------------------------------------------------------------------
        [get gamefactory,     GET,         /lobby/mygame/,   "",            "", "",                 404,                  	Not found],
	[get gamefactory,     POST,         /lobby/mygame/,   "",            "", "",                 404,                  	Not found]
    ]

    '''
   
    decoder = json.JSONDecoder(parse_int=True, strict=True)

    with open(path, 'rb') as f:
        raws = f.readlines()

    fraw = _prune_comments(raws)
    valid_json = _commentify(fraw)
    json_list = decoder.decode(valid_json)
    kwargs = _extract_kwargs(json_list)
   
    return kwargs


def _extract_kwargs(json_list):
    kwarg_names = json_list[0]

    res = []
    for test in json_list[1:]:
        kwargs = {}
        for i, value in enumerate(test):
            if not value: None
            kwargs[kwarg_names[i].replace(' ', '_')] = value

        res.append(kwargs)
    return res

def _prune_comments(raws):
    raw = ''
    for line in raws:
        match = line.find('%')
        if match != -1:
            raw += line[:match]
        else:
            raw += line

    return raw


def _commentify(raw):
    '''
    inputs the " for the raw to be valid JSON,
    '''

    search_wstart = True
    search_wend = False
        
    formatted_raw = ''
    for char in raw:
        if char and search_wstart and _is_digit_or_number(char):
            formatted_raw += '"'+char
            search_wstart = False
            search_wend = True
            
        elif search_wend and char in [',', ']'] :
            formatted_raw +=  '"' + char
            search_wend = False
            search_wstart = True
            
        else:
            formatted_raw += char
            
    return formatted_raw

def _is_digit_or_number(char):
    od = ord(char)
    return  (od >= 97 and od <= 122 or
            od >= 65 and od <= 90 or
            char.isdigit() or char in ['/'])

def _tester(description, method, uri, data, username, password, expected_statuscode, reason):
    print description
    print method
    print uri

if __name__ == '__main__':
    _tester(**parse('example.test')[1])
    

# TODO:
# read keyword names
# use these coupled with each column, as input to testfunction
