// 简化的Three.js可视化实现
class HNSWVisualization {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.nodes = [];
        this.connections = [];
        this.animationId = null;
        
        // 延迟初始化，等待Three.js加载完成
        setTimeout(() => this.init(), 100);
    }

    init() {
        try {
            // 检查Three.js是否加载
            if (typeof THREE === 'undefined') {
                console.error('Three.js未加载');
                setTimeout(() => this.init(), 500);
                return;
            }

            // 创建场景
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x181825);

            // 创建相机
            const canvas = document.getElementById('threeCanvas');
            const container = canvas.parentElement;
            
            // 确保canvas占满容器
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            
            this.camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
            this.camera.position.set(15, 20, 25);
            this.camera.lookAt(0, 0, 0);

            // 创建渲染器
            this.renderer = new THREE.WebGLRenderer({ 
                canvas: canvas,
                antialias: true 
            });
            this.renderer.setSize(containerWidth, containerHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            
            console.log(`Canvas初始化尺寸: ${containerWidth} x ${containerHeight}`);

            // 添加轨道控制器
            if (typeof THREE.OrbitControls !== 'undefined') {
                this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
                this.controls.enableDamping = true;
                this.controls.dampingFactor = 0.05;
                this.controls.screenSpacePanning = false;
                this.controls.minDistance = 10;
                this.controls.maxDistance = 100;
                this.controls.maxPolarAngle = Math.PI;
            }

            // 添加光源
            const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
            this.scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
            directionalLight.position.set(50, 50, 50);
            directionalLight.castShadow = true;
            this.scene.add(directionalLight);

            // 坐标轴已移除，通过分层平面来表示空间方向

            // 窗口大小调整
            window.addEventListener('resize', () => this.onWindowResize());

            // 开始动画循环
            this.animate();
            
            // 延迟调整尺寸，确保容器已完全渲染
            setTimeout(() => {
                this.onWindowResize();
            }, 100);
            
            console.log('Three.js可视化初始化完成');
        console.log(`初始化完成 - 容器尺寸: ${containerWidth} x ${containerHeight}`);
        } catch (error) {
            console.error('Three.js初始化失败:', error);
            // 重试初始化
            setTimeout(() => this.init(), 1000);
        }
    }

    // 创建节点球体
    createNode(position, color = 0x89b4fa, size = 0.5, id = 0, layer = 0) {
        const geometry = new THREE.SphereGeometry(size, 16, 16);
        const material = new THREE.MeshPhongMaterial({ 
            color: color,
            shininess: 100,
            transparent: layer > 0,
            opacity: layer > 0 ? 0.8 : 1.0
        });
        
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(position[0], position[1], position[2]);
        
        // 添加用户数据
        sphere.userData = { id: id, type: 'node', layer: layer };
        
        this.scene.add(sphere);
        
        // 为每个节点添加标签
        this.createNodeLabel(sphere, id);
        
        return sphere;
    }

    // 创建节点编号标签（直接在球体中心显示）
    createNodeLabel(node, id) {
        try {
            // 创建文本纹理
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 128;
            canvas.height = 128;
            
            // 绘制透明背景的文本
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = '#ffffff';
            context.font = 'bold 48px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(id.toString(), canvas.width / 2, canvas.height / 2);
            
            // 创建纹理
            const texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;
            
            // 创建标签平面，放在球体中心
            const labelGeometry = new THREE.PlaneGeometry(0.8, 0.8);
            const labelMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                alphaTest: 0.1,
                depthTest: false // 确保文字始终可见
            });
            
            const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
            labelMesh.position.copy(node.position);
            labelMesh.renderOrder = 1; // 确保在球体之上渲染
            
            // 让标签始终面向相机
            labelMesh.userData = { type: 'label', nodeId: id };
            
            this.scene.add(labelMesh);
            this.connections.push(labelMesh);
            
            // 保存标签引用用于更新
            this.nodeLabels = this.nodeLabels || [];
            this.nodeLabels.push({ label: labelMesh, nodeId: id, node });
            
        } catch (error) {
            console.warn('创建节点标签失败:', error);
        }
    }

    // 备用HTML标签方法
    createHTMLLabel(node, id) {
        const label = document.createElement('div');
        label.className = 'node-label';
        label.textContent = id;
        label.style.cssText = `
            position: absolute;
            color: white;
            background: rgba(0,0,0,0.8);
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 12px;
            pointer-events: none;
            font-family: monospace;
            z-index: 1000;
            border: 1px solid rgba(255,255,255,0.3);
        `;
        
        const canvas = document.getElementById('threeCanvas');
        canvas.parentElement.appendChild(label);
        
        this.nodeLabels = this.nodeLabels || [];
        this.nodeLabels.push({ label, nodeId: id, node, isHTML: true });
    }

    // 创建连接线
    createConnection(startNode, endNode, color = 0x585b70, layer = 0) {
        const material = new THREE.LineBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.6 
        });

        const points = [
            new THREE.Vector3(startNode.position.x, startNode.position.y, startNode.position.z),
            new THREE.Vector3(endNode.position.x, endNode.position.y, endNode.position.z)
        ];

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        
        line.userData = { 
            type: 'connection', 
            startId: startNode.userData.id, 
            endId: endNode.userData.id,
            layer: layer 
        };
        
        this.scene.add(line);
        return line;
    }

    // 可视化HNSW状态
    visualizeStep(stepData) {
        // 清空场景
        this.clearScene();
        
        if (!stepData || !stepData.nodes) {
            console.warn('无效的步骤数据');
            return;
        }

        // 创建分层平面
        this.createLayerPlanes();

        // 创建所有已插入的节点并按层分布
        stepData.nodes.forEach(node => {
            if (node.vector && Array.isArray(node.vector) && node.inserted) {
                const color = this.getNodeColor(node, stepData);
                
                // 为每个层级创建节点副本
                if (node.layers && node.layers.length > 0) {
                    node.layers.forEach(layer => {
                        const nodePosition = [...node.vector];
                        nodePosition[1] = layer * 6; // Y轴分层，每层间隔6个单位
                        
                        const size = layer === 0 ? 0.6 : 0.4; // 底层节点稍大
                        const sphere = this.createNode(nodePosition, color, size, node.id, layer);
                        this.nodes.push(sphere);
                    });
                }
            }
        });

        // 创建连接
        stepData.nodes.forEach(node => {
            if (node.neighbors && Array.isArray(node.neighbors)) {
                for (let layer = 0; layer < node.neighbors.length; layer++) {
                    if (node.neighbors[layer] && Array.isArray(node.neighbors[layer])) {
                        node.neighbors[layer].forEach(neighbor => {
                            // 找到对应层级的节点
                            const startNode = this.nodes.find(n => 
                                n.userData.id === node.id && n.userData.layer === layer);
                            const endNode = this.nodes.find(n => 
                                n.userData.id === neighbor.id && n.userData.layer === layer);
                            
                            if (startNode && endNode) {
                                const color = this.getConnectionColor(layer);
                                const connection = this.createConnection(startNode, endNode, color, layer);
                                this.connections.push(connection);
                            }
                        });
                    }
                }
            }
        });

        // 高亮搜索路径
        if (stepData.searchPath && stepData.searchPath.length > 0) {
            this.highlightSearchPath(stepData.searchPath);
        }

        // 高亮入口点
        if (stepData.entryPoint !== null && stepData.entryPoint !== undefined) {
            this.highlightEntryPoint(stepData.entryPoint);
        }

        // 添加跨层连接
        this.createCrossLayerConnections(stepData.nodes);

        console.log('可视化步骤完成，节点数:', this.nodes.length, '连接数:', this.connections.length);
    }

    // 创建分层平面
    createLayerPlanes() {
        if (!window.hnsw) return;
        
        const maxLayers = window.hnsw.maxLayers;
        
        // 创建各层级平面
        for (let layer = 0; layer < maxLayers; layer++) {
            // 创建半透明平面
            const planeGeometry = new THREE.PlaneGeometry(30, 30);
            const planeMaterial = new THREE.MeshBasicMaterial({
                color: this.getLayerColor(layer),
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.05
            });
            
            const plane = new THREE.Mesh(planeGeometry, planeMaterial);
            plane.rotation.x = Math.PI / 2;
            plane.position.y = layer * 6;
            plane.userData = { type: 'layer-plane', layer: layer };
            
            this.scene.add(plane);
            this.connections.push(plane);
            
            // 创建层级边框
            const edges = new THREE.EdgesGeometry(planeGeometry);
            const lineMaterial = new THREE.LineBasicMaterial({ 
                color: this.getLayerColor(layer),
                transparent: true,
                opacity: 0.3
            });
            const wireframe = new THREE.LineSegments(edges, lineMaterial);
            wireframe.rotation.x = Math.PI / 2;
            wireframe.position.y = layer * 6;
            
            this.scene.add(wireframe);
            this.connections.push(wireframe);
            
            // 创建层标签
            this.createLayerLabel(`Layer ${layer}`, layer * 6);
        }
    }

    // 创建层标签
    createLayerLabel(layerName, yPos) {
        const label = document.createElement('div');
        label.className = 'layer-label';
        label.textContent = layerName;
        label.style.cssText = `
            position: absolute;
            color: white;
            background: rgba(0,0,0,0.8);
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 12px;
            pointer-events: none;
            font-weight: bold;
            border: 1px solid rgba(255,255,255,0.3);
        `;
        
        // 使用粗略的2D投影（简化实现）
        const canvas = document.getElementById('threeCanvas');
        canvas.parentElement.appendChild(label);
        
        // 根据层级位置计算标签位置
        const layerIndex = parseInt(layerName.replace('Layer ', ''));
        const topOffset = 300 - (layerIndex * 40);
        
        label.style.left = '20px';
        label.style.top = `${topOffset}px`;
        
        this.layerLabels = this.layerLabels || [];
        this.layerLabels.push(label);
    }

    // 获取层颜色
    getLayerColor(layer) {
        const colors = [0x89b4fa, 0xa6e3a1, 0xf9e2af, 0xf5c2e7, 0x74c7ec];
        return colors[layer % colors.length];
    }

    // 获取节点颜色
    getNodeColor(node, stepData) {
        // 搜索路径中的节点
        if (stepData.searchPath && stepData.searchPath.some(n => n && n.id === node.id)) {
            return 0xf38ba8; // 红色 - 查询路径
        }
        
        // 入口点
        if (stepData.entryPoint === node.id) {
            return 0xf9e2af; // 黄色 - 入口点
        }
        
        return 0x89b4fa; // 蓝色 - 普通节点
    }

    // 获取连接颜色
    getConnectionColor(layer) {
        const colors = [0xa6e3a1, 0xf9e2af, 0x89b4fa, 0xf5c2e7]; // 不同层的颜色
        return colors[layer % colors.length] || 0x585b70;
    }

    // 高亮搜索路径
    highlightSearchPath(searchPath) {
        // 为搜索路径中的每个节点在所有层级添加高亮
        searchPath.forEach((pathNode, index) => {
            if (pathNode && pathNode.id !== undefined) {
                // 找到该节点在所有层级的表示
                const nodeSpheresInAllLayers = this.nodes.filter(n => n.userData.id === pathNode.id);
                
                nodeSpheresInAllLayers.forEach(sphere => {
                    // 添加搜索路径高亮环
                    const geometry = new THREE.RingGeometry(0.8, 1.2, 16);
                    const material = new THREE.MeshBasicMaterial({ 
                        color: 0xf38ba8, 
                        side: THREE.DoubleSide,
                        transparent: true,
                        opacity: 0.6
                    });
                    
                    const ring = new THREE.Mesh(geometry, material);
                    ring.position.copy(sphere.position);
                    ring.rotation.x = Math.PI / 2;
                    ring.userData = { type: 'search-highlight' };
                    this.scene.add(ring);
                    this.connections.push(ring);
                });
            }
        });

        // 连接搜索路径中相邻的节点
        for (let i = 0; i < searchPath.length - 1; i++) {
            const currentNode = searchPath[i];
            const nextNode = searchPath[i + 1];
            
            if (currentNode && nextNode && currentNode.id !== undefined && nextNode.id !== undefined) {
                // 在底层连接搜索路径
                const startSphere = this.nodes.find(n => 
                    n.userData.id === currentNode.id && n.userData.layer === 0);
                const endSphere = this.nodes.find(n => 
                    n.userData.id === nextNode.id && n.userData.layer === 0);
                
                if (startSphere && endSphere) {
                    const material = new THREE.LineBasicMaterial({ 
                        color: 0xf38ba8,
                        linewidth: 4,
                        transparent: true,
                        opacity: 0.8
                    });

                    const points = [
                        new THREE.Vector3(startSphere.position.x, startSphere.position.y, startSphere.position.z),
                        new THREE.Vector3(endSphere.position.x, endSphere.position.y, endSphere.position.z)
                    ];

                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    const line = new THREE.Line(geometry, material);
                    line.userData = { type: 'search-path' };
                    this.scene.add(line);
                    this.connections.push(line);
                }
            }
        }
    }

    // 高亮入口点
    highlightEntryPoint(entryPointId) {
        // 找到入口点在所有层级的表示
        const entrySpheresInAllLayers = this.nodes.filter(n => n.userData.id === entryPointId);
        
        entrySpheresInAllLayers.forEach(sphere => {
            // 添加入口点光环效果
            const geometry = new THREE.RingGeometry(0.7, 1.1, 16);
            const material = new THREE.MeshBasicMaterial({ 
                color: 0xf9e2af, 
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.9
            });
            
            const ring = new THREE.Mesh(geometry, material);
            ring.position.copy(sphere.position);
            ring.rotation.x = Math.PI / 2;
            ring.userData = { type: 'entry-point-highlight' };
            this.scene.add(ring);
            this.connections.push(ring);
            
            // 添加脉冲动画效果
            const time = Date.now() * 0.003;
            ring.scale.setScalar(1 + Math.sin(time) * 0.1);
        });
    }

    // 清空场景
    clearScene() {
        // 移除节点
        this.nodes.forEach(node => {
            if (this.scene) {
                this.scene.remove(node);
            }
        });
        this.nodes = [];

        // 移除连接
        this.connections.forEach(connection => {
            if (this.scene) {
                this.scene.remove(connection);
            }
        });
        this.connections = [];

        // 移除层标签
        if (this.layerLabels) {
            this.layerLabels.forEach(label => {
                if (label.parentElement) {
                    label.parentElement.removeChild(label);
                }
            });
            this.layerLabels = [];
        }

        // 移除节点标签
        if (this.nodeLabels) {
            this.nodeLabels.forEach(labelData => {
                if (labelData.isHTML && labelData.label.parentElement) {
                    // HTML标签
                    labelData.label.parentElement.removeChild(labelData.label);
                } else if (!labelData.isHTML && labelData.label && this.scene) {
                    // 3D标签
                    this.scene.remove(labelData.label);
                }
            });
            this.nodeLabels = [];
        }
    }

    // 窗口大小调整
    onWindowResize() {
        if (this.camera && this.renderer) {
            const canvas = document.getElementById('threeCanvas');
            const container = canvas.parentElement;
            
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            
            this.camera.aspect = containerWidth / containerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(containerWidth, containerHeight);
            
            console.log(`Canvas调整尺寸: ${containerWidth} x ${containerHeight}`);
        }
    }

    // 动画循环
    animate() {
        if (!this.scene || !this.camera || !this.renderer) {
            // 如果初始化未完成，等待下次重试
            setTimeout(() => this.animate(), 100);
            return;
        }

        this.animationId = requestAnimationFrame(() => this.animate());
        
        // 更新轨道控制器
        if (this.controls) {
            this.controls.update();
        }
        
        // 节点旋转动画
        this.nodes.forEach((node, index) => {
            const time = Date.now() * 0.001;
            node.rotation.y = Math.sin(time + index * 0.1) * 0.1;
        });

        // 更新节点标签位置
        this.updateNodeLabels();

        this.renderer.render(this.scene, this.camera);
    }

    // 更新节点标签位置
    updateNodeLabels() {
        if (!this.nodeLabels || !this.camera || !this.renderer) return;
        
        this.nodeLabels.forEach(labelData => {
            const { label, node, isHTML } = labelData;
            
            try {
                if (isHTML) {
                    // HTML标签的位置更新
                    const vector = new THREE.Vector3();
                    node.getWorldPosition(vector);
                    vector.project(this.camera);
                    
                    const canvas = document.getElementById('threeCanvas');
                    const rect = canvas.getBoundingClientRect();
                    
                    // 检查节点是否在相机前方
                    if (vector.z > 1) {
                        label.style.display = 'none';
                        return;
                    }
                    
                    const x = (vector.x * 0.5 + 0.5) * rect.width + rect.left;
                    const y = (-vector.y * 0.5 + 0.5) * rect.height + rect.top;
                    
                    // 确保标签在可视区域内
                    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                        label.style.display = 'block';
                        label.style.left = (x + 10) + 'px';
                        label.style.top = (y - 15) + 'px';
                    } else {
                        label.style.display = 'none';
                    }
                } else {
                    // 3D标签的位置更新（让标签面向相机）
                    if (label && label.lookAt) {
                        label.lookAt(this.camera.position);
                        // 保持标签在节点上方
                        label.position.copy(node.position);
                        label.position.y += 1;
                    }
                }
            } catch (error) {
                console.warn('更新节点标签位置时出错:', error);
            }
        });
    }

    // 创建跨层连接
    createCrossLayerConnections(nodes) {
        // 为每个节点创建跨层连接
        nodes.forEach(node => {
            if (node.layers && node.layers.length > 1) {
                // 找到该节点在所有层级的表示
                const nodeSpheresInAllLayers = this.nodes.filter(n => n.userData.id === node.id);
                
                // 按层级排序
                nodeSpheresInAllLayers.sort((a, b) => a.userData.layer - b.userData.layer);
                
                // 创建相邻层级之间的虚线连接
                for (let i = 0; i < nodeSpheresInAllLayers.length - 1; i++) {
                    const lowerSphere = nodeSpheresInAllLayers[i];
                    const upperSphere = nodeSpheresInAllLayers[i + 1];
                    
                    // 创建虚线材质
                    const material = new THREE.LineDashedMaterial({
                        color: 0x89b4fa,
                        dashSize: 0.3,
                        gapSize: 0.2,
                        transparent: true,
                        opacity: 0.6
                    });
                    
                    const points = [
                        new THREE.Vector3(lowerSphere.position.x, lowerSphere.position.y, lowerSphere.position.z),
                        new THREE.Vector3(upperSphere.position.x, upperSphere.position.y, upperSphere.position.z)
                    ];
                    
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    const line = new THREE.Line(geometry, material);
                    line.computeLineDistances(); // 必须调用这个方法才能显示虚线
                    
                    line.userData = { type: 'cross-layer-connection', nodeId: node.id };
                    
                    this.scene.add(line);
                    this.connections.push(line);
                }
            }
        });
    }

    // 可视化搜索步骤
    visualizeSearchStep(searchStepData) {
        // 清空场景
        this.clearScene();
        
        if (!searchStepData || !searchStepData.nodes) {
            console.warn('无效的搜索步骤数据');
            return;
        }

        // 创建分层平面
        this.createLayerPlanes();

        // 创建所有已插入的节点并按层分布
        searchStepData.nodes.forEach(node => {
            if (node.vector && Array.isArray(node.vector) && node.inserted) {
                const color = this.getSearchNodeColor(node, searchStepData);
                
                // 为每个层级创建节点副本
                if (node.layers && node.layers.length > 0) {
                    node.layers.forEach(layer => {
                        const nodePosition = [...node.vector];
                        nodePosition[1] = layer * 6; // Y轴分层，每层间隔6个单位
                        
                        const size = this.getSearchNodeSize(node, searchStepData, layer);
                        const sphere = this.createNode(nodePosition, color, size, node.id, layer);
                        this.nodes.push(sphere);
                    });
                }
            }
        });

        // 创建连接
        searchStepData.nodes.forEach(node => {
            if (node.neighbors && Array.isArray(node.neighbors)) {
                for (let layer = 0; layer < node.neighbors.length; layer++) {
                    if (node.neighbors[layer] && Array.isArray(node.neighbors[layer])) {
                        node.neighbors[layer].forEach(neighbor => {
                            // 找到对应层级的节点
                            const startNode = this.nodes.find(n => 
                                n.userData.id === node.id && n.userData.layer === layer);
                            const endNode = this.nodes.find(n => 
                                n.userData.id === neighbor.id && n.userData.layer === layer);
                            
                            if (startNode && endNode) {
                                const color = this.getSearchConnectionColor(layer, searchStepData);
                                const connection = this.createConnection(startNode, endNode, color, layer);
                                this.connections.push(connection);
                            }
                        });
                    }
                }
            }
        });

        // 高亮查询节点
        if (searchStepData.queryNodeId !== undefined) {
            this.highlightQueryNode(searchStepData.queryNodeId);
        }

        // 高亮当前搜索层
        if (searchStepData.currentLayer !== null && searchStepData.currentLayer !== undefined) {
            this.highlightCurrentLayer(searchStepData.currentLayer);
        }

        // 高亮当前候选节点
        if (searchStepData.currentNodes && searchStepData.currentNodes.length > 0) {
            this.highlightCurrentNodes(searchStepData.currentNodes, searchStepData.currentLayer);
        }

        // 显示搜索路径
        if (searchStepData.searchPath && searchStepData.searchPath.length > 0) {
            this.visualizeSearchPath(searchStepData.searchPath);
        }

        // 根据搜索阶段添加特殊效果
        this.addSearchPhaseEffects(searchStepData);

        // 添加跨层连接
        this.createCrossLayerConnections(searchStepData.nodes);

        console.log('搜索步骤可视化完成，阶段:', searchStepData.phase);
    }

    // 获取搜索节点颜色
    getSearchNodeColor(node, searchStepData) {
        // 查询节点
        if (node.id === searchStepData.queryNodeId) {
            return 0xf38ba8; // 红色 - 查询节点
        }
        
        // 当前候选节点
        if (searchStepData.currentNodes && searchStepData.currentNodes.some(n => n.id === node.id)) {
            return 0xa6e3a1; // 绿色 - 当前候选
        }
        
        // 搜索路径中的节点
        if (searchStepData.searchPath && searchStepData.searchPath.some(n => n.id === node.id)) {
            return 0xf9e2af; // 黄色 - 搜索路径
        }
        
        return 0x89b4fa; // 蓝色 - 普通节点
    }

    // 获取搜索节点大小
    getSearchNodeSize(node, searchStepData, layer) {
        let baseSize = layer === 0 ? 0.6 : 0.4;
        
        // 查询节点稍大
        if (node.id === searchStepData.queryNodeId) {
            baseSize *= 1.3;
        }
        
        // 当前候选节点稍大
        if (searchStepData.currentNodes && searchStepData.currentNodes.some(n => n.id === node.id)) {
            baseSize *= 1.2;
        }
        
        return baseSize;
    }

    // 获取搜索连接颜色
    getSearchConnectionColor(layer, searchStepData) {
        // 当前搜索层的连接更亮
        if (layer === searchStepData.currentLayer) {
            return 0xfab387; // 橙色 - 当前层连接
        }
        
        const colors = [0xa6e3a1, 0xf9e2af, 0x89b4fa, 0xf5c2e7];
        return colors[layer % colors.length] || 0x585b70;
    }

    // 高亮查询节点
    highlightQueryNode(queryNodeId) {
        const querySpheresInAllLayers = this.nodes.filter(n => n.userData.id === queryNodeId);
        
        querySpheresInAllLayers.forEach(sphere => {
            // 添加查询节点的特殊光环
            const geometry = new THREE.RingGeometry(0.9, 1.4, 16);
            const material = new THREE.MeshBasicMaterial({ 
                color: 0xf38ba8, 
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8
            });
            
            const ring = new THREE.Mesh(geometry, material);
            ring.position.copy(sphere.position);
            ring.rotation.x = Math.PI / 2;
            ring.userData = { type: 'query-highlight' };
            this.scene.add(ring);
            this.connections.push(ring);
            
            // 添加脉冲动画
            const time = Date.now() * 0.005;
            ring.scale.setScalar(1 + Math.sin(time) * 0.15);
        });
    }

    // 高亮当前搜索层
    highlightCurrentLayer(currentLayer) {
        // 为当前层添加特殊边框
        const planeGeometry = new THREE.PlaneGeometry(32, 32);
        const edges = new THREE.EdgesGeometry(planeGeometry);
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0xfab387,
            linewidth: 3,
            transparent: true,
            opacity: 0.8
        });
        const wireframe = new THREE.LineSegments(edges, lineMaterial);
        wireframe.rotation.x = Math.PI / 2;
        wireframe.position.y = currentLayer * 6;
        wireframe.userData = { type: 'current-layer-highlight' };
        
        this.scene.add(wireframe);
        this.connections.push(wireframe);
    }

    // 高亮当前候选节点
    highlightCurrentNodes(currentNodes, currentLayer) {
        currentNodes.forEach(node => {
            // 找到该节点在当前层的表示
            const sphere = this.nodes.find(n => 
                n.userData.id === node.id && n.userData.layer === currentLayer);
            
            if (sphere) {
                // 添加候选节点光环
                const geometry = new THREE.RingGeometry(0.7, 1.0, 16);
                const material = new THREE.MeshBasicMaterial({ 
                    color: 0xa6e3a1, 
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.7
                });
                
                const ring = new THREE.Mesh(geometry, material);
                ring.position.copy(sphere.position);
                ring.rotation.x = Math.PI / 2;
                ring.userData = { type: 'candidate-highlight' };
                this.scene.add(ring);
                this.connections.push(ring);
            }
        });
    }

    // 可视化搜索路径
    visualizeSearchPath(searchPath) {
        // 连接搜索路径中相邻的节点（在底层）
        for (let i = 0; i < searchPath.length - 1; i++) {
            const currentNode = searchPath[i];
            const nextNode = searchPath[i + 1];
            
            if (currentNode && nextNode && currentNode.id !== undefined && nextNode.id !== undefined) {
                const startSphere = this.nodes.find(n => 
                    n.userData.id === currentNode.id && n.userData.layer === 0);
                const endSphere = this.nodes.find(n => 
                    n.userData.id === nextNode.id && n.userData.layer === 0);
                
                if (startSphere && endSphere) {
                    const material = new THREE.LineBasicMaterial({ 
                        color: 0xf9e2af,
                        linewidth: 4,
                        transparent: true,
                        opacity: 0.9
                    });

                    const points = [
                        new THREE.Vector3(startSphere.position.x, startSphere.position.y, startSphere.position.z),
                        new THREE.Vector3(endSphere.position.x, endSphere.position.y, endSphere.position.z)
                    ];

                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    const line = new THREE.Line(geometry, material);
                    line.userData = { type: 'search-path-line' };
                    this.scene.add(line);
                    this.connections.push(line);
                }
            }
        }

        // 为搜索路径中的每个节点添加路径标记
        searchPath.forEach((pathNode, index) => {
            if (pathNode && pathNode.id !== undefined) {
                const nodeSpheresInAllLayers = this.nodes.filter(n => n.userData.id === pathNode.id);
                
                nodeSpheresInAllLayers.forEach(sphere => {
                    // 添加路径序号标记
                    const geometry = new THREE.RingGeometry(0.5, 0.7, 8);
                    const material = new THREE.MeshBasicMaterial({ 
                        color: 0xf9e2af, 
                        side: THREE.DoubleSide,
                        transparent: true,
                        opacity: 0.6
                    });
                    
                    const ring = new THREE.Mesh(geometry, material);
                    ring.position.copy(sphere.position);
                    ring.position.z += 0.1; // 稍微前移避免重叠
                    ring.rotation.x = Math.PI / 2;
                    ring.userData = { type: 'path-marker', pathIndex: index };
                    this.scene.add(ring);
                    this.connections.push(ring);
                });
            }
        });
    }

    // 添加搜索阶段特效
    addSearchPhaseEffects(searchStepData) {
        switch (searchStepData.phase) {
            case 'init':
                // 初始化阶段 - 添加准备效果
                this.addInitializationEffect();
                break;
                
            case 'entry':
                // 入口点阶段 - 高亮入口点
                if (searchStepData.currentNodes && searchStepData.currentNodes.length > 0) {
                    this.addEntryPointEffect(searchStepData.currentNodes[0].id);
                }
                break;
                
            case 'layer-search':
                // 层搜索阶段 - 添加搜索波纹效果
                this.addLayerSearchEffect(searchStepData.currentLayer);
                break;
                
            case 'layer-move':
                // 层移动阶段 - 添加移动轨迹
                this.addMoveTrailEffect(searchStepData);
                break;
                
            case 'fine-search':
                // 精细搜索阶段 - 添加扩散效果
                this.addFineSearchEffect(searchStepData);
                break;
                
            case 'complete':
                // 完成阶段 - 添加成功效果
                this.addCompletionEffect(searchStepData);
                break;
        }
    }

    // 初始化效果
    addInitializationEffect() {
        // 添加整体场景的淡入效果（通过调整透明度）
        this.nodes.forEach(node => {
            if (node.material) {
                node.material.transparent = true;
                node.material.opacity = 0.3;
            }
        });
    }

    // 入口点效果
    addEntryPointEffect(entryPointId) {
        const entrySpheresInAllLayers = this.nodes.filter(n => n.userData.id === entryPointId);
        
        entrySpheresInAllLayers.forEach(sphere => {
            // 添加入口点光环效果
            const geometry = new THREE.RingGeometry(1.0, 1.5, 16);
            const material = new THREE.MeshBasicMaterial({ 
                color: 0xf9e2af, 
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8
            });
            
            const ring = new THREE.Mesh(geometry, material);
            ring.position.copy(sphere.position);
            ring.rotation.x = Math.PI / 2;
            ring.userData = { type: 'entry-effect' };
            this.scene.add(ring);
            this.connections.push(ring);
        });
    }

    // 层搜索效果
    addLayerSearchEffect(currentLayer) {
        // 在当前层添加搜索波纹
        const geometry = new THREE.RingGeometry(5, 15, 32);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xfab387, 
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.2
        });
        
        const ripple = new THREE.Mesh(geometry, material);
        ripple.rotation.x = Math.PI / 2;
        ripple.position.y = currentLayer * 6;
        ripple.userData = { type: 'search-ripple' };
        this.scene.add(ripple);
        this.connections.push(ripple);
    }

    // 移动轨迹效果
    addMoveTrailEffect(searchStepData) {
        // 在当前层显示移动轨迹
        if (searchStepData.currentNodes && searchStepData.currentNodes.length > 0) {
            const currentNode = searchStepData.currentNodes[0];
            const sphere = this.nodes.find(n => 
                n.userData.id === currentNode.id && n.userData.layer === searchStepData.currentLayer);
            
            if (sphere) {
                // 添加移动指示器
                const geometry = new THREE.ConeGeometry(0.3, 1, 8);
                const material = new THREE.MeshBasicMaterial({ 
                    color: 0xa6e3a1,
                    transparent: true,
                    opacity: 0.8
                });
                
                const cone = new THREE.Mesh(geometry, material);
                cone.position.copy(sphere.position);
                cone.position.y += 1.5;
                cone.userData = { type: 'move-indicator' };
                this.scene.add(cone);
                this.connections.push(cone);
            }
        }
    }

    // 精细搜索效果
    addFineSearchEffect(searchStepData) {
        // 在底层添加扩散搜索效果
        if (searchStepData.currentNodes && searchStepData.currentNodes.length > 0) {
            searchStepData.currentNodes.forEach(node => {
                const sphere = this.nodes.find(n => 
                    n.userData.id === node.id && n.userData.layer === 0);
                
                if (sphere) {
                    // 添加扩散圆环
                    const geometry = new THREE.RingGeometry(1.5, 3.0, 16);
                    const material = new THREE.MeshBasicMaterial({ 
                        color: 0x74c7ec, 
                        side: THREE.DoubleSide,
                        transparent: true,
                        opacity: 0.4
                    });
                    
                    const ring = new THREE.Mesh(geometry, material);
                    ring.position.copy(sphere.position);
                    ring.rotation.x = Math.PI / 2;
                    ring.userData = { type: 'fine-search-ring' };
                    this.scene.add(ring);
                    this.connections.push(ring);
                }
            });
        }
    }

    // 完成效果
    addCompletionEffect(searchStepData) {
        if (searchStepData.result) {
            // 高亮最终结果
            const resultSpheresInAllLayers = this.nodes.filter(n => n.userData.id === searchStepData.result.nodeId);
            
            resultSpheresInAllLayers.forEach(sphere => {
                // 添加成功光环
                const geometry = new THREE.RingGeometry(1.2, 2.0, 16);
                const material = new THREE.MeshBasicMaterial({ 
                    color: 0xa6e3a1, 
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.9
                });
                
                const ring = new THREE.Mesh(geometry, material);
                ring.position.copy(sphere.position);
                ring.rotation.x = Math.PI / 2;
                ring.userData = { type: 'success-ring' };
                this.scene.add(ring);
                this.connections.push(ring);
                
                // 添加成功粒子效果
                this.addSuccessParticles(sphere.position);
            });
        }
    }

    // 成功粒子效果
    addSuccessParticles(position) {
        const particleCount = 20;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = position.x + (Math.random() - 0.5) * 4;
            positions[i * 3 + 1] = position.y + (Math.random() - 0.5) * 4;
            positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 4;
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0xa6e3a1,
            size: 0.2,
            transparent: true,
            opacity: 0.8
        });
        
        const particleSystem = new THREE.Points(particles, material);
        particleSystem.userData = { type: 'success-particles' };
        this.scene.add(particleSystem);
        this.connections.push(particleSystem);
    }

    // 强制刷新canvas尺寸
    forceResize() {
        console.log('强制刷新canvas尺寸...');
        this.onWindowResize();
    }

    // 停止动画
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// 全局可视化实例
window.visualization = new HNSWVisualization();