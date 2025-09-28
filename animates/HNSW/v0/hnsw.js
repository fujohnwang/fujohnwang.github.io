// HNSW算法实现
class HNSW {
    constructor(maxConnections = 4, maxLayers = 3) {
        this.maxConnections = maxConnections;
        this.maxLayers = maxLayers; // 可调层数
        this.entryPoint = null;
        this.nodes = [];
        this.currentStep = 0;
        this.steps = [];
        this.searchPath = [];
    }

    // 生成随机节点数据
    generateNodes(count) {
        this.nodes = [];
        for (let i = 0; i < count; i++) {
            this.nodes.push({
                id: i,
                vector: this.generateRandomVector(3), // 3D向量用于3D可视化
                layers: [],
                neighbors: Array(this.maxLayers).fill().map(() => [])
            });
        }
        return this.nodes;
    }

    // 生成随机向量
    generateRandomVector(dimensions) {
        const vector = [];
        for (let i = 0; i < dimensions; i++) {
            vector.push(Math.random() * 10 - 5); // 在-5到5之间
        }
        return vector;
    }

    // 计算欧几里得距离
    calculateDistance(vec1, vec2) {
        let sum = 0;
        for (let i = 0; i < vec1.length; i++) {
            sum += Math.pow(vec1[i] - vec2[i], 2);
        }
        return Math.sqrt(sum);
    }

    // 选择节点的层数（指数分布）
    selectLayer() {
        const mL = 1 / Math.log(2); // 层级因子
        const level = Math.floor(-Math.log(Math.random()) * mL);
        return Math.min(level, this.maxLayers - 1);
    }

    // 构建HNSW索引
    buildIndex() {
        this.steps = [];
        this.currentStep = 0;
        this.entryPoint = null;

        // 添加初始步骤：空的索引状态
        this.addStep('初始化索引', `准备构建HNSW索引，将逐个插入${this.nodes.length}个节点`);

        // 创建一个临时的构建节点列表，用于逐步插入
        const nodesToInsert = [...this.nodes];

        // 重置所有节点的连接和层级
        this.nodes.forEach(node => {
            node.neighbors = Array(this.maxLayers).fill().map(() => []);
            node.layers = [];
            node.inserted = false; // 标记节点是否已插入
        });

        // 步骤1: 插入第一个节点作为入口点
        if (nodesToInsert.length > 0) {
            const firstNode = nodesToInsert[0];
            const firstLayer = this.selectLayer();
            firstNode.layers = Array(firstLayer + 1).fill().map((_, idx) => idx);
            firstNode.inserted = true;
            this.entryPoint = firstNode;
            this.addStep('插入第一个节点', `节点${firstNode.id}被插入并分配到${firstLayer + 1}层，设为入口点`);
        }

        // 步骤2: 逐个插入剩余节点
        for (let i = 1; i < nodesToInsert.length; i++) {
            const node = nodesToInsert[i];
            const nodeLayer = this.selectLayer();
            node.layers = Array(nodeLayer + 1).fill().map((_, idx) => idx);
            node.inserted = true;

            this.addStep(`插入节点${node.id}`, `节点${node.id}被插入并分配到${nodeLayer + 1}层`);

            // 从入口点开始搜索
            let currentNodes = [this.entryPoint];
            let currentMaxLayer = Math.max(...this.entryPoint.layers);

            // 从最高层向下搜索到目标节点的层+1
            for (let layer = currentMaxLayer; layer > nodeLayer; layer--) {
                currentNodes = this.searchLayerGreedy(node, currentNodes, layer, 1);
                this.addStep(`在第${layer}层搜索插入位置`, `当前最近节点: ${currentNodes[0].id}`);
            }

            // 在节点存在的每一层进行搜索和连接
            for (let layer = Math.min(nodeLayer, currentMaxLayer); layer >= 0; layer--) {
                const candidates = this.searchLayerGreedy(node, currentNodes, layer, this.maxConnections * 2);

                // 选择最佳邻居
                const selectedNeighbors = this.selectNeighbors(node, candidates, this.maxConnections);

                // 建立双向连接
                node.neighbors[layer] = selectedNeighbors;
                selectedNeighbors.forEach(neighbor => {
                    if (!neighbor.neighbors[layer].find(n => n.id === node.id)) {
                        neighbor.neighbors[layer].push(node);

                        // 如果邻居连接数超过限制，进行修剪
                        if (neighbor.neighbors[layer].length > this.maxConnections) {
                            neighbor.neighbors[layer] = this.selectNeighbors(
                                neighbor,
                                neighbor.neighbors[layer],
                                this.maxConnections
                            );
                        }
                    }
                });

                this.addStep(`在第${layer}层建立连接`,
                    `节点${node.id}与邻居建立连接: ${selectedNeighbors.map(n => n.id).join(', ')}`);

                currentNodes = selectedNeighbors;
            }

            // 更新入口点（如果新节点层数更高）
            if (nodeLayer > currentMaxLayer) {
                this.entryPoint = node;
                this.addStep(`更新入口点`, `节点${node.id}层数更高，成为新的入口点`);
            }
        }

        this.addStep('索引构建完成', `HNSW索引构建完成，共${this.nodes.length}个节点`);
    }

    // 贪婪搜索层
    searchLayerGreedy(queryNode, entryPoints, layer, numClosest) {
        const visited = new Set();
        const candidates = [];
        const w = []; // 动态候选列表

        // 初始化
        entryPoints.forEach(ep => {
            const dist = this.calculateDistance(queryNode.vector, ep.vector);
            candidates.push({ node: ep, distance: dist });
            w.push({ node: ep, distance: dist });
            visited.add(ep.id);
        });

        // 按距离排序
        candidates.sort((a, b) => a.distance - b.distance);

        while (candidates.length > 0) {
            const current = candidates.shift();

            // 如果当前距离大于w中最远的距离，停止搜索
            if (w.length >= numClosest && current.distance > w[w.length - 1].distance) {
                break;
            }

            // 检查当前节点的邻居
            const neighbors = current.node.neighbors[layer] || [];
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor.id)) {
                    visited.add(neighbor.id);
                    const dist = this.calculateDistance(queryNode.vector, neighbor.vector);

                    if (w.length < numClosest || dist < w[w.length - 1].distance) {
                        candidates.push({ node: neighbor, distance: dist });
                        w.push({ node: neighbor, distance: dist });

                        // 保持w按距离排序并限制大小
                        w.sort((a, b) => a.distance - b.distance);
                        if (w.length > numClosest) {
                            w.pop();
                        }

                        // 保持candidates按距离排序
                        candidates.sort((a, b) => a.distance - b.distance);
                    }
                }
            }
        }

        return w.map(item => item.node);
    }

    // 在指定层搜索（用于最终搜索）
    searchLayer(queryNode, entryPoint, layer, ef) {
        return this.searchLayerGreedy(queryNode, [entryPoint], layer, ef);
    }

    // 选择最佳邻居（启发式选择）
    selectNeighbors(node, candidates, maxConnections) {
        if (candidates.length <= maxConnections) {
            return candidates;
        }

        // 简单启发式：选择距离最近的邻居
        const candidatesWithDist = candidates.map(candidate => ({
            node: candidate,
            distance: this.calculateDistance(node.vector, candidate.vector)
        }));

        candidatesWithDist.sort((a, b) => a.distance - b.distance);
        return candidatesWithDist.slice(0, maxConnections).map(item => item.node);
    }

    // 获取最大层数
    getMaxLayer() {
        return this.maxLayers - 1;
    }

    // 搜索最近邻居（支持分步骤展示）
    search(queryNodeId, ef = 10) {
        this.searchSteps = []; // 专门用于搜索步骤
        this.searchPath = [];
        const queryNode = this.nodes[queryNodeId];
        if (!queryNode || !this.entryPoint) return null;

        // 重置搜索相关的步骤索引
        this.searchStepIndex = 0;

        this.addSearchStep('准备搜索', `开始搜索节点${queryNodeId}`, {
            queryNodeId: queryNodeId,
            currentLayer: null,
            currentNodes: [],
            searchPath: [],
            phase: 'init'
        });

        let currentNodes = [this.entryPoint];
        let currentMaxLayer = Math.max(...this.entryPoint.layers);
        this.searchPath.push(this.entryPoint);

        this.addSearchStep('设置入口点', `从入口点节点${this.entryPoint.id}开始搜索`, {
            queryNodeId: queryNodeId,
            currentLayer: currentMaxLayer,
            currentNodes: [this.entryPoint],
            searchPath: [...this.searchPath],
            phase: 'entry'
        });

        // 从最高层向下搜索到第1层
        for (let layer = currentMaxLayer; layer >= 1; layer--) {
            this.addSearchStep(`第${layer}层搜索`, `在第${layer}层进行贪婪搜索`, {
                queryNodeId: queryNodeId,
                currentLayer: layer,
                currentNodes: [...currentNodes],
                searchPath: [...this.searchPath],
                phase: 'layer-search'
            });

            const newCurrentNodes = this.searchLayerGreedy(queryNode, currentNodes, layer, 1);
            if (newCurrentNodes.length > 0 && newCurrentNodes[0].id !== currentNodes[0].id) {
                this.searchPath.push(newCurrentNodes[0]);
                this.addSearchStep(`第${layer}层移动`, `移动到更近的节点${newCurrentNodes[0].id}`, {
                    queryNodeId: queryNodeId,
                    currentLayer: layer,
                    currentNodes: newCurrentNodes,
                    searchPath: [...this.searchPath],
                    phase: 'layer-move'
                });
            }
            currentNodes = newCurrentNodes;
        }

        // 在第0层执行精细搜索
        this.addSearchStep('底层精细搜索', `在第0层执行精细搜索，ef=${ef}`, {
            queryNodeId: queryNodeId,
            currentLayer: 0,
            currentNodes: [...currentNodes],
            searchPath: [...this.searchPath],
            phase: 'fine-search'
        });

        const candidates = this.searchLayerGreedy(queryNode, currentNodes, 0, ef);

        // 记录搜索路径中的所有候选节点
        candidates.forEach(candidate => {
            if (!this.searchPath.find(n => n.id === candidate.id)) {
                this.searchPath.push(candidate);
            }
        });

        if (candidates.length > 0) {
            const nearest = candidates[0];
            const distance = this.calculateDistance(queryNode.vector, nearest.vector);

            this.addSearchStep('搜索完成', `找到最近邻居: 节点${nearest.id}，距离: ${distance.toFixed(2)}`, {
                queryNodeId: queryNodeId,
                currentLayer: 0,
                currentNodes: [nearest],
                searchPath: [...this.searchPath],
                phase: 'complete',
                result: { nodeId: nearest.id, distance: distance }
            });

            return nearest;
        }

        return null;
    }

    // 添加搜索步骤
    addSearchStep(title, description, searchData) {
        // 创建搜索步骤的安全拷贝
        const stepData = {
            title: title,
            description: description,
            queryNodeId: searchData.queryNodeId,
            currentLayer: searchData.currentLayer,
            currentNodes: searchData.currentNodes.map(node => ({
                id: node.id,
                vector: [...node.vector],
                layers: [...node.layers]
            })),
            searchPath: searchData.searchPath.map(node => ({
                id: node.id,
                vector: [...node.vector],
                layers: [...node.layers]
            })),
            phase: searchData.phase,
            result: searchData.result || null,
            // 包含当前已插入的节点状态
            nodes: this.nodes.filter(node => node.inserted === true).map(node => ({
                id: node.id,
                vector: [...node.vector],
                layers: [...node.layers],
                inserted: true,
                neighbors: node.neighbors.map(layerNeighbors =>
                    layerNeighbors.map(neighbor => ({
                        id: neighbor.id,
                        vector: [...neighbor.vector],
                        layers: [...neighbor.layers]
                    }))
                )
            }))
        };

        this.searchSteps = this.searchSteps || [];
        this.searchSteps.push(stepData);
    }

    // 添加演示步骤
    addStep(title, description) {
        // 只包含已插入的节点，避免循环引用
        const insertedNodes = this.nodes.filter(node => node.inserted === true);
        const nodesCopy = insertedNodes.map(node => ({
            id: node.id,
            vector: [...node.vector],
            layers: [...node.layers],
            inserted: true,
            neighbors: node.neighbors.map(layerNeighbors =>
                layerNeighbors.map(neighbor => ({
                    id: neighbor.id,
                    vector: [...neighbor.vector],
                    layers: [...neighbor.layers]
                }))
            )
        }));

        this.steps.push({
            title: title,
            description: description,
            nodes: nodesCopy,
            searchPath: this.searchPath.map(pathNode => ({
                id: pathNode.id,
                vector: [...pathNode.vector],
                layers: [...pathNode.layers]
            })),
            entryPoint: this.entryPoint ? this.entryPoint.id : null
        });
    }

    // 获取当前步骤
    getCurrentStep() {
        return this.steps[this.currentStep] || null;
    }

    // 获取下一步
    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            return this.getCurrentStep();
        }
        return null;
    }

    // 获取上一步
    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            return this.getCurrentStep();
        }
        return null;
    }
}

// 全局HNSW实例
window.hnsw = new HNSW();