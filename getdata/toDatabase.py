from credentials import Secrets
import csv
import psycopg2

symb = []
with open("russell.csv", 'r') as russell:
    symb = russell.read().split(',')

string = symb[0]
dates = {}
with open(f'csv/{string}price.csv', 'r') as toRead:
    reader = csv.reader(toRead,delimiter  = ',')
    for row in reader:
        dates[row[0]] = []

sdates = set()
for string in symb[:5]:
    with open(f'csv/{string}price.csv', 'r') as toRead:
        reader = csv.reader(toRead, delimiter = ',')
        for row in reader:
            if row[1] != ' price':
                sdates.add(row[0])
print(len(sdates))


for string in symb:
    with open(f'csv/{string}price.csv', 'r') as toRead:
        reader = csv.reader(toRead, delimiter = ',')
        ndates = set()
        for row in reader:
            ndates.add(row[0])
            dates[row[0]].append(row[1])
        for date in sdates - ndates:
            dates[date].append(0)
del dates['date']

# w = 0
# for k, v in dates.items():
#     if w > 5: break
#     print('insert into price ("theday", "aapl", "msft", "goog") values (\'{}\', {});'.format(k, str(v[:3])[1:-1].replace("'", '')))
#     print(k)
#     w += 1

conn = psycopg2.connect( host="localhost", database="postgres", user=Secrets.user, password=Secrets.password)
cur = conn.cursor()
for k, v in dates.items():
    cur.execute('insert into pastprice ("theday", "aapl", "msft", "goog", "googl", "amzn", "tsla", "fb", "brk.b", "nvda", "jpm", "v", "jnj", "unh", "hd", "wmt", "bac", "pg", "ma", "pfe", "xom", "dis", "ko", "csco", "avgo", "adbe", "cvx", "pep", "lly", "acn", "tmo", "abbv", "nke", "orcl", "cmcsa", "wfc", "nflx", "abt", "cost", "crm", "vz", "intc", "pypl", "dhr", "qcom", "mrk", "mcd", "t", "ms", "ups", "schw", "txn", "low", "nee", "amd", "unp", "pm", "intu", "hon", "mdt", "bmy", "amat", "cvs", "tmus", "c", "rtx", "axp", "blk", "ba", "gs", "amgn", "cat", "el", "ibm", "sbux", "de", "amt", "pld", "ge", "isrg", "chtr", "cop", "antm", "tgt", "mu", "spgi", "mmm", "now", "syk", "bkng", "lmt", "f", "zts", "adp", "lrcx", "pnc", "mdlz", "usb", "mo", "gild", "gm", "tfc", "tjx", "mrna", "cb", "shw", "snow", "csx", "mmc", "bx", "cci", "cme", "duk", "uber", "ci", "hca", "itw", "ew", "bdx", "team", "nsc", "ice", "so", "fisv", "rivn", "fis", "cl", "cof", "fdx", "etn", "mco", "eqix", "mrvl", "wm", "apd", "regn", "fcx", "d", "ecl", "pgr", "klac", "psa", "bsx", "noc", "adi", "ilmn", "aon", "eog", "gd", "nxpi", "sq", "emr", "vrtx", "adsk", "met", "jci", "exc", "kdp", "mar", "spg", "bk", "scco", "info", "dg", "aig", "slb", "pxd", "hum", "ftnt", "snps", "atvi", "mnst", "panw", "aph", "nem", "iqv", "wday", "kmb", "rop", "xlnx", "wba", "cnc", "mchp", "stz", "zm", "orly", "khc", "ctsh", "aep", "payx", "idxx", "carr", "cdns", "mpc", "dlr", "tt", "dow", "dxcm", "pru", "msci", "dd", "a", "sre", "lhx", "dell", "gpn", "bax", "aptv", "cmg", "msi", "azo", "ph", "ctas", "afl", "hpq", "dash", "hlt", "sivb", "lulu", "gis", "rsg", "algn", "syy", "ebay", "spot", "hsy", "kkr", "trv", "ppg", "trow", "kmi", "adm", "mck", "rok", "well", "psx", "dfs", "yum", "xel", "iff", "rost", "ea", "rmd", "amp", "sbac", "twlo", "odfl", "otis", "crwd", "kr", "tdg", "ctva", "all", "dhi", "stt", "cbre", "wmb", "zs", "avb", "fast", "mtch", "biib", "ddog", "mtd", "frc", "eqr", "keys", "vlo", "tsn", "fitb", "cmi", "lyb", "ajg", "dvn", "peg", "u", "ame", "pcar", "ttd", "len.b", "len", "cprt", "vrsk", "are", "glw", "nue", "lsxma", "lsxmk", "fwonk", "fwona", "oxy", "swk", "gfs", "veev", "pcg", "ndaq", "bf.b", "bf.a", "wy", "efx", "twtr", "anss", "wec", "epam", "awk", "net", "es", "dltr", "okta", "pltr", "ed", "bll", "csgp", "o", "wtw", "lvs", "lng", "vfc", "wst", "zbra", "abc", "hes", "on", "ntrs", "exr", "alb", "oke", "bkr", "cern", "luv", "syf", "expe", "hrl", "zbh", "lbrda", "lbrdk", "lh", "dal", "vmc", "ftv", "cdw", "tsco", "gww", "mdb", "invh", "dov", "rjf", "docu", "ter", "mlm", "lyv", "vrsn", "mkc", "siri", "grmn", "ccl", "swks", "chd", "maa", "hban", "sgen", "hal", "key", "bby", "hig", "uri", "eix", "ir", "it", "rf", "cfg", "mtb", "ste", "dte", "sui", "ppl", "dre", "avtr", "aee", "k", "pki", "fe", "ess", "hpe", "clx", "fang", "hubs", "etr", "coo", "sbny", "fox", "foxa", "jbht", "roku", "rcl", "ntap", "tru", "etsy", "vtr", "ssnc", "expd", "mgm", "wdc", "xyl", "wat", "payc", "yumc", "hznp", "ulta", "pins", "pool", "pfg", "flt", "mpwr", "nvr", "gpc", "tdy", "tyl", "bxp", "gnrc", "peak", "cinf", "bro", "enph", "bio", "splk", "dish", "ip", "trmb", "br", "kmx", "ce", "amcr", "ctlt", "bill", "agr", "ui", "cms", "hei", "hei.a", "cg", "dri", "clr", "akam", "ally", "udr", "vtrs", "czr", "acgl", "entg", "vici", "ttwo", "dgx", "ctra", "crl", "alny", "nuan", "holx", "ben", "dpz", "avy", "wab", "j", "mkl", "cnp", "rprx", "cpt", "iex", "emn", "txt", "moh", "omc", "lkq", "podd", "mas", "cag", "rol", "fds", "incy", "bmrn", "qrvo", "burl", "fnf", "mos", "tech", "l", "ual", "kim", "aes", "sjm", "nlok", "tfx", "dt", "bldr", "evrg", "pwr", "wrb", "lnt", "aap", "ipg", "els", "wpc", "rng", "olpx", "bbwi", "cah", "hwm", "disck", "ffiv", "aci", "mro", "eqh", "phm", "fmc", "cck", "whr", "mpw", "lyft", "fbhs", "chrw", "lpla", "has", "ato", "cf", "z", "zg", "amh", "abmd", "ndsn", "bg", "cpb", "mktx", "plug", "vmw", "nws", "nwsa", "ptc", "uhal", "wlk", "aos", "w", "irm", "reg", "jll", "lnc", "masi", "ggg", "trgp", "pkg", "exas", "gddy", "ldos", "cma", "cday", "hst", "morn", "cboe", "ares", "elan", "wtrg", "cna", "sc", "trex", "ewbc", "wal", "csl", "cgnx", "tdoc", "lumn", "aal", "wrk", "rhi", "stld", "jkhy", "wolf", "zen", "mtn", "fico", "clvt", "bwa", "mhk", "rpm", "sna", "bki", "ctxs", "xray", "fnd", "dva", "wso", "apa", "nly", "bah", "afg", "rrx", "lsi", "ivz", "cube", "lea", "pnr", "jnpr", "rexr", "aa", "alle", "uhs", "re", "cien", "ni", "clf", "sci", "qgen", "pcty", "lii", "zion", "bsy", "midd", "vst", "tap", "hubb", "wsm", "iac", "hsic", "tpr", "dar", "acm", "brkr", "glpi", "rgen", "coup", "rs", "gl", "snx", "ttc", "frt", "gxo", "st", "znga", "fhn", "azpn", "anet", "nwl", "glob", "see", "jbl", "lw", "nrg", "lamr", "dox", "bery", "five", "dkng", "axon", "rh", "g", "wynn", "mksi", "tw", "txg", "ugi", "oc", "synh", "knx", "agco", "avlr", "cabo", "armk", "y", "site", "uthr", "gme", "jef", "arw", "pcor", "pen", "stor", "lad", "cpri", "deck", "cfr", "smg", "pbct", "estc", "cnxc", "upst", "vrt", "wms", "eqt", "aiz", "vno", "faf", "jazz", "pton", "fslr", "seic", "oln", "manh", "tpl", "airc", "cacc", "gwre", "itt", "dxc", "ipgp", "rl", "erie", "chh", "nvax", "fivn", "cbsh", "dnb", "tpx", "gntx", "ogn", "chdn", "nnn", "hun", "pnfp", "usfd", "pag", "krc", "osk", "voya", "agl", "xpo", "leco", "tol", "cold", "agnc", "pega", "wh", "pnw", "pstg", "bld", "fr", "ua", "uaa", "gh", "atr", "mat", "rga", "brx", "ori", "tndm", "fcnca", "bokf", "hii", "rnr", "acc", "smar", "wix", "sf", "penn", "bc", "snv", "che", "cvna", "lite", "bpop", "coty", "bfam", "axta", "oge", "pltk", "nbix", "lfus", "plnt", "dbx", "ohi", "oled", "ibkr", "wu", "nlsn", "dci", "open", "nvst", "gmed", "stwd", "twks", "pb", "pvh", "an", "post", "casy", "atus", "wwd", "vac", "ayi", "nyt", "nvcr", "hta", "pii", "omf", "jhg", "dks", "alk", "mtz", "byd", "infa", "wex", "nxst", "gps", "x", "lpx", "ppc", "newr", "run", "kss", "plan", "qs", "ingr", "reyn", "eeft", "rgld", "exp", "azek", "azta", "iaa", "vvv", "ntra", "cohr", "chng", "ehc", "caci", "amg", "yeti", "lstr", "nov", "dei", "nvt", "srpt", "ntnx", "cr", "nycb", "pri", "cuz", "mrtx", "mdu", "src", "colm", "adt", "esi", "ozk", "slm", "gpk", "shc", "ash", "dlb", "hbi", "skx", "flo", "pacw", "hog", "bepc", "cc", "iart", "algm", "msa", "wtfc", "man", "son", "ryn", "wbs", "tho", "nfg", "osh", "unm", "ncr", "hhc", "stl", "exel", "leg", "tkr", "ida", "nati", "cw", "slg", "srcl", "ambp", "drvn", "mtg", "evr", "hayw", "clh", "prgo", "crus", "tmx", "awi", "nrz", "wen", "mcw", "vnt", "fcn", "vmi", "achc", "cdk", "al", "tfsl", "laz", "spr", "cvac", "vsco", "hlf", "sam", "nclh", "saic", "hiw", "thg", "qdel", "chpt", "tnl", "nfe", "gtes", "pinc", "tsp", "dtm", "unvr", "jblu", "axs", "amed", "h", "rare", "slgn", "hxl", "tdc", "mcfe", "icui", "seb", "he", "umpq", "pk", "bhf", "ions", "bynd", "ncno", "pycr", "bwxt", "cert", "fnb", "stne", "fl", "spb", "xrx", "woof", "r", "chgg", "dv", "lesl", "fls", "frpt", "avt", "cri", "msp", "mrvi", "alsn", "jamf", "hpp", "kd", "msm", "kmpr", "fhb", "hrb", "dsey", "kex", "cnm", "jbgs", "ago", "mndt", "hain", "neu", "swch", "jwn", "dct", "fsly", "boh", "figs", "trip", "six", "epr", "ayx", "lope", "vsat", "msgs", "virt", "mrcy", "ftdr", "qrtea", "wtm", "sabr", "olli", "mcy", "lz", "ai", "adpt", "cpa", "four", "go", "spce", "sage", "sndr", "iova", "vmeo", "wwe", "shls", "sklz", "swi", "nktr", "sgfy", "lmnd", "comm", "evbg", "dh", "rkt", "nabl", "slvm", "flnc", "vrm", "onl", "lylt", "uwmc", "psfe", "goco") values (\'{}\', {}) on conflict ("theday") do nothing;'.format(k, str(v)[1:-1].replace("'", '')))
    print(k)
conn.commit()
cur.close()
conn.close()