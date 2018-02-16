
def dump_node(id, label):
    print "        {"
    print "            \"id\": " + str(id) + ","
    print "            \"label\": \"" + label.strip().replace("\"", "\\\"") + "\","
    print "        },"

class Edge:
    def __init__(self, src, dst, weight):
        self.src = src
        self.dst = dst
        self.weight = weight

    def dump_me(self):
        print "        {"
        print "            \"source\": " + str(self.src) + ","
        print "            \"target\": " + str(self.dst) + ","
        print "            \"weight\": " + str(self.weight)
        print "        },"

#########################################################

nodes = []
edges = []

first = True

with open("data_links.csv") as lines:
    for line in lines:
        values = line.split(";")
        if first:
            first = False
        else:
            idx1 = -1
            try:
                idx1 = nodes.index(values[0])
            except:
                idx1 = len(nodes)
                nodes.append(values[0])
            idx2 = -1
            try:
                idx2 = nodes.index(values[1])
            except:
                idx2 = len(nodes)
                nodes.append(values[1])
            weight = int(values[2])
            edges.append(Edge(idx1, idx2, weight))

#########################################################

print "var g_data ="
print "{"
print "    nodes: ["

for i in range(0, len(nodes)):
    dump_node(i, nodes[i])

print "    ],"
print "    edges: ["

for edge in edges:
    edge.dump_me()

print "    ]"
print "};"



