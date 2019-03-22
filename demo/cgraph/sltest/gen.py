
import random
import string

def genRndName():
    return ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(6))

def genRndState():
    nodeNum = random.randint(2, 10)
    edgeNum = random.randint(2, 10)
    print("{")
    print("  nodes: [")
    for i in range(0, nodeNum):
        print("    {")
        print("      \"id\": %d," % (i + 1))
        print("      \"label\": \"%s\"," % genRndName())
        print("      \"weight\": %d" % random.randint(5, 50))
        print("    },")
    print("  ],")
    print("  edges: [")
    for i in range(0, edgeNum):
        print("    {")
        print("          \"source\": %d," % random.randint(1, nodeNum))
        print("          \"target\": %d," % random.randint(1, nodeNum))
        print("          \"weight\": %d" % random.randint(1, 10))
        print("    },")
    print("  ]")
    print("},")


l1 = 4
l2 = 3
l3 = 6

print("var g_data =")
print("{")
print("    stateLines: [")
print("        [\"alpha\", \"beta\", \"gamma\", \"delta\"],")
print("        [\"one\", \"two\", \"three\"],")
print("        [\"2000\", \"2001\", \"2002\", \"2003\", \"2004\", \"2005\"]")
print("    ],")
print("")
print("    states: {")
print("")

for i in range(0, l1):
    for j in range(0, l2):
        for k in range(0, l3):
            print("\"%d|%d|%d\":" % (i, j, k))
            genRndState()

print("")
print("    }")
print("}")
