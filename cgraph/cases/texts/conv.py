
class Node:
    def __init__(self, id, label):
        self.id = id
        self.label = label
        self.group = -1
        self.weight = -1
        self.number = -1

    def dump_me(self):
        print "        {"
        print "            \"id\": " + str(self.id) + ","
        print "            \"label\": \"" + self.label.strip() + "\","
        print "            \"group\": " + str(self.group) + ","
        print "            \"weight\": " + str(self.weight) + ","
        print "            \"nmb\": " + str(self.number)
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

with open("data.csv") as lines:
    for line in lines:
        values = line.split(",")
        if values[0] == "":
            for i in range(0, len(values) - 1):
                nodes.append(Node(i, values[i + 1]))
        elif values[0] == "numbers":
            for i in range(0, len(values) - 1):
                nodes[i].number = int(values[i + 1])
        elif values[0] == "frequencies":
            for i in range(0, len(values) - 1):
                nodes[i].weight = int(values[i + 1])
        elif values[0] == "modularity_class":
            for i in range(0, len(values) - 1):
                nodes[i].group = int(values[i + 1])
        else:
            index = -1
            for i in range(1, len(values)):
                if len(values[i].strip()) == 0:
                    index = i - 1
                    break
            if index == -1:
                raise ValueError("o_O")
            for i in range(0, len(values) - 1):
                if i != index:
                    w = int(values[i + 1])
                    for edge in edges:
                        if edge.src == i and edge.dst == index:
                            if edge.weight != w:
                                raise ValueError("O_O")
                            else:
                                w = 0
                            break
                    if w > 0:
                        edges.append(Edge(index, i, w))

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
