
class Node:
    def __init__(self, id, label, weight, date):
        self.id = id
        self.label = label.strip()
        self.weight = int(weight.strip())
        self.date = date.strip()

    def dump_me(self):
        print "        {"
        print "            \"id\": " + str(self.id) + ","
        print "            \"label\": \"" + self.label.strip().replace("\"", "\\\"") + "\","
        print "            \"weight\": " + str(self.weight) + ","
        print "            \"date\": \"" + self.date + "\""
        print "        },"

class Edge:
    def __init__(self, src, dst, weight):
        self.src = src
        self.dst = dst
        self.weight = int(weight.strip())

    def dump_me(self):
        print "        {"
        print "            \"source\": " + str(self.src) + ","
        print "            \"target\": " + str(self.dst) + ","
        print "            \"weight\": " + str(self.weight)
        print "        },"

#########################################################

nodes = []
edges = []

skip = 2
index = 0

with open("data_raw.csv") as lines:
    for line in lines:
        if skip > 0:
            skip = skip - 1
        else:
            values = line.split(",")
            index = index + 1
            nodes.append(Node(index, values[2], values[5], values[3]))

skip = 1

with open("data_links.csv") as lines:
    for line in lines:
        if skip > 0:
            skip = skip - 1
        else:
            values = line.split(",")
            src = next((node for node in nodes if node.label == values[0].strip()), None)
            dst = next((node for node in nodes if node.label == values[1].strip()), None)
            if src and dst:
                edges.append(Edge(src.id, dst.id, values[2]))

#########################################################

print "var g_data ="
print "{"
print "    nodes: ["

for node in nodes:
    node.dump_me()

print "    ],"
print "    edges: ["

for edge in edges:
    edge.dump_me()

print "    ]"
print "};"



