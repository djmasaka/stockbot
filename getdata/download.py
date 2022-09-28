from credentials import Secrets
import requests
import json

symb = []
with open("russell.csv", 'r') as russell:
    symb = russell.read().split(',')


for string in symb:
    response = requests.get(f'https://cloud.iexapis.com/stable/stock/{string}/chart/1m?chartCloseOnly=true&token={Secrets.token}')
    
    if response:
        with open(f'csv/{string}price.csv', 'w') as toWrite:
            toWrite.write("date, price")
            data = json.loads(response.content)
            for dat in data:
                toWrite.write(f"\n{dat['date']},{dat['close']}")
    else:
        print("error in the response ", string)

# disca, cfx, hfc, ads
# with open('brk.bprice.csv', 'w') as toWrite:
#     toWrite.write("date, price")
#     with open('brk.bresp.json', 'r') as string:
#         data = json.loads(string.read())
#         for dat in data:
#             toWrite.write(f"\n{dat['date']},{dat['close']}")



















# for string in symb[:2]:
#     response = requests.get(f'https://cloud.iexapis.com/stable/stock/{string}/chart/2y?chartCloseOnly=true&token=pk_e9e60a972b224360b7b89fb3e5b88589')
    
#     if response:
#         with open(f'json/{string}price.json', 'w') as toWrite:
#             toWrite.write(response.text)
#             # data = json.loads(response.content)
#             # toWrite.write(json.dumps(data))
#     else:
#         print("error in the response")