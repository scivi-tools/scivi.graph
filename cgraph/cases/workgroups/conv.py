
# -*- coding: utf-8 -*-

class Node:
    def __init__(self, id, label, weight, group):
        self.id = id
        self.label = label.strip()
        self.group = int(float(group.strip()))
        self.weight = int(float(weight.strip()))

    def dump_me(self):
        print "        {"
        print "            \"id\": " + str(self.id) + ","
        print "            \"label\": \"" + self.label + "\","
        print "            \"group\": " + str(self.group) + ","
        print "            \"weight\": " + str(self.weight)
        print "        },"

class Edge:
    def __init__(self, src, dst, weight):
        self.src = src
        self.dst = dst
        self.weight = int(float(weight.strip()))

    def dump_me(self):
        print "        {"
        print "            \"source\": " + str(self.src) + ","
        print "            \"target\": " + str(self.dst) + ","
        print "            \"weight\": " + str(self.weight)
        print "        },"

#########################################################

index = 0
index_trans = {}

nodes = []
edges = []

first = True

# with open("0 кластер.Nodes.csv") as lines:
with open("671 кластер.Nodes.csv") as lines:
    for line in lines:
        if first:
            first = False
        else:
            values = line.split(",")
            # nodes.append(Node(index, values[1], values[3], values[5]))
            nodes.append(Node(index, values[1], values[4], values[6]))
            index_trans[values[0]] = index
            index = index + 1

first = True

# with open("0 кластер.Edges.csv") as lines:
with open("671 кластер.Edges.csv") as lines:
    for line in lines:
        if first:
            first = False
        else:
            values = line.split(",")
            edges.append(Edge(index_trans[values[0]], index_trans[values[1]], values[3]))
            edges.append(Edge(index_trans[values[1]], index_trans[values[0]], values[3]))

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
