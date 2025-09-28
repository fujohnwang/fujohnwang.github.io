// 演示控制逻辑
class HNSWDemo {
    constructor() {
        this.isPlaying = false;
        this.animationInterval = null;
        this.currentStepIndex = 0;
        this.isSearchMode = false;
        this.searchStepIndex = 0;
        
        // 等待页面加载完成后初始化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    // 初始化演示
    init() {
        console.log('开始初始化HNSW演示...');
        
        // 初始化HNSW算法
        this.initializeHNSW();
        
        // 设置事件监听器
        this.setupEventListeners();
        
        console.log('HNSW演示初始化完成');
    }

    // 初始化HNSW算法
    initializeHNSW() {
        const nodeCount = parseInt(document.getElementById('nodeCount').value) || 20;
        const maxConnections = parseInt(document.getElementById('maxConnections').value) || 4;
        const maxLayers = parseInt(document.getElementById('maxLayers').value) || 3;

        console.log(`初始化HNSW: 节点数=${nodeCount}, 最大连接数=${maxConnections}, 层数=${maxLayers}`);

        // 创建新的HNSW实例
        window.hnsw = new HNSW(maxConnections, maxLayers);
        
        // 生成节点
        window.hnsw.generateNodes(nodeCount);
        
        // 构建索引（这会生成所有演示步骤）
        window.hnsw.buildIndex();

        // 重置演示状态
        this.currentStepIndex = 0;
        this.isPlaying = false;
        this.stopAnimation();

        // 显示初始状态
        this.showStep(0);
        this.updateControlButtons();

        // 强制刷新canvas尺寸
        setTimeout(() => {
            if (window.visualization) {
                window.visualization.forceResize();
            }
        }, 200);

        document.getElementById('unifiedInfo').innerHTML = 
            `<strong>HNSW索引已构建</strong><br>共${window.hnsw.steps.length}个演示步骤<br>当前显示：空索引状态<br>点击"下一步"开始逐个插入节点...`;
    }

    // 设置事件监听器
    setupEventListeners() {
        // 为输入框添加事件监听
        document.getElementById('nodeCount').addEventListener('change', () => {
            this.initializeHNSW();
        });
        
        document.getElementById('maxConnections').addEventListener('change', () => {
            this.initializeHNSW();
        });
        
        document.getElementById('maxLayers').addEventListener('change', () => {
            this.initializeHNSW();
        });

        // 播放间隔输入框事件监听
        const playIntervalInput = document.getElementById('playInterval');
        if (playIntervalInput) {
            playIntervalInput.addEventListener('change', () => {
                const interval = parseFloat(playIntervalInput.value) || 2;
                console.log(`播放间隔已更改为: ${interval}秒`);
                
                // 如果正在播放，重新启动以应用新的间隔
                if (this.isPlaying) {
                    this.pauseAnimation();
                    setTimeout(() => this.playAnimation(), 100);
                }
            });

            // 实时验证输入值
            playIntervalInput.addEventListener('input', () => {
                const value = parseFloat(playIntervalInput.value);
                if (value < 0.5) {
                    playIntervalInput.value = 0.5;
                } else if (value > 10) {
                    playIntervalInput.value = 10;
                }
            });
        }

        // 键盘控制
        document.addEventListener('keydown', (event) => {
            this.handleKeyPress(event);
        });

        // 画布点击事件
        document.getElementById('threeCanvas').addEventListener('click', (event) => {
            this.handleCanvasClick(event);
        });

        // 窗口大小调整事件
        window.addEventListener('resize', () => {
            if (window.visualization) {
                window.visualization.onWindowResize();
            }
        });

        // 设置播放按钮的初始点击事件
        const playBtn = document.getElementById('playBtn');
        if (playBtn) {
            playBtn.onclick = () => this.playAnimation();
        }

        console.log('事件监听器设置完成');
    }

    // 显示指定步骤
    showStep(stepIndex) {
        if (!window.hnsw || !window.hnsw.steps || window.hnsw.steps.length === 0) {
            console.error('HNSW步骤数据无效');
            return;
        }

        if (stepIndex >= 0 && stepIndex < window.hnsw.steps.length) {
            this.currentStepIndex = stepIndex;
            const step = window.hnsw.steps[stepIndex];
            
            console.log(`显示步骤 ${stepIndex}: ${step.title}`);
            
            // 更新演示信息
            document.getElementById('unifiedInfo').innerHTML = 
                `<strong>${step.title}</strong><br>${step.description}`;
            
            // 更新3D可视化
            if (window.visualization) {
                window.visualization.visualizeStep(step);
            }
            
            // 更新控制按钮状态
            this.updateControlButtons();
        }
    }

    // 下一步
    nextStep() {
        if (this.isSearchMode) {
            // 搜索模式下使用搜索步骤控制
            this.nextSearchStep();
        } else if (window.hnsw && this.currentStepIndex < window.hnsw.steps.length - 1) {
            // 构建模式下使用构建步骤控制
            this.showStep(this.currentStepIndex + 1);
        }
    }

    // 上一步
    previousStep() {
        if (this.isSearchMode) {
            // 搜索模式下使用搜索步骤控制
            this.previousSearchStep();
        } else if (this.currentStepIndex > 0) {
            // 构建模式下使用构建步骤控制
            this.showStep(this.currentStepIndex - 1);
        }
    }

    // 播放动画
    playAnimation() {
        if (this.isPlaying) return;

        this.isPlaying = true;
        this.updateControlButtons();

        // 获取用户设置的播放间隔时间
        const intervalInput = document.getElementById('playInterval');
        const intervalSeconds = intervalInput ? parseFloat(intervalInput.value) || 2 : 2;
        const intervalMs = intervalSeconds * 1000;

        this.animationInterval = setInterval(() => {
            if (this.isSearchMode && window.hnsw && window.hnsw.searchSteps) {
                // 搜索模式下的播放
                if (this.searchStepIndex < window.hnsw.searchSteps.length - 1) {
                    this.nextSearchStep();
                } else {
                    this.pauseAnimation();
                }
            } else if (window.hnsw && this.currentStepIndex < window.hnsw.steps.length - 1) {
                // 构建模式下的播放
                this.nextStep();
            } else {
                this.pauseAnimation();
            }
        }, intervalMs);

        console.log(`开始播放动画，间隔: ${intervalSeconds}秒`);
    }

    // 暂停动画
    pauseAnimation() {
        this.isPlaying = false;
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
        this.updateControlButtons();
        console.log('暂停动画');
    }

    // 停止动画
    stopAnimation() {
        this.pauseAnimation();
        this.showStep(0);
        console.log('停止动画');
    }

    // 更新控制按钮状态
    updateControlButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const playBtn = document.getElementById('playBtn');
        const resetBtn = document.getElementById('resetBtn');

        if (this.isSearchMode) {
            // 搜索模式下使用搜索步骤控制
            this.updateSearchControlButtons();
        } else {
            // 构建模式下使用构建步骤控制
            if (window.hnsw && window.hnsw.steps) {
                prevBtn.disabled = this.currentStepIndex === 0;
                nextBtn.disabled = this.currentStepIndex === window.hnsw.steps.length - 1;
            } else {
                prevBtn.disabled = true;
                nextBtn.disabled = true;
            }
            
            // 播放按钮在播放时显示为"暂停"文本
            if (this.isPlaying) {
                playBtn.textContent = '暂停';
                playBtn.onclick = () => this.pauseAnimation();
            } else {
                playBtn.textContent = '播放';
                playBtn.onclick = () => this.playAnimation();
            }
            
            // 重置按钮恢复正常功能
            if (resetBtn) {
                resetBtn.textContent = '重置';
                resetBtn.onclick = () => resetDemo();
            }
        }
    }

    // 搜索节点
    searchNode() {
        const queryNodeId = parseInt(document.getElementById('queryNode').value) || 0;
        
        if (!window.hnsw || !window.hnsw.nodes || window.hnsw.nodes.length === 0) {
            document.getElementById('unifiedInfo').innerHTML = 
                '<strong>搜索错误</strong><br><span style="color: #f38ba8;">HNSW索引未初始化</span>';
            return;
        }

        if (queryNodeId < 0 || queryNodeId >= window.hnsw.nodes.length) {
            document.getElementById('unifiedInfo').innerHTML = 
                `<strong>搜索错误</strong><br><span style="color: #f38ba8;">节点ID超出范围 (0-${window.hnsw.nodes.length - 1})</span>`;
            return;
        }

        console.log(`开始搜索节点 ${queryNodeId}`);
        
        // 执行搜索（生成搜索步骤）
        const result = window.hnsw.search(queryNodeId);
        
        if (result && window.hnsw.searchSteps) {
            // 进入搜索演示模式
            this.isSearchMode = true;
            this.searchStepIndex = 0;
            
            // 显示第一个搜索步骤
            this.showSearchStep(0);
            
            // 更新控制按钮为搜索模式
            this.updateSearchControlButtons();
            
            console.log(`搜索完成: 节点${queryNodeId} -> 节点${result.id}, 共${window.hnsw.searchSteps.length}个搜索步骤`);
        } else {
            document.getElementById('unifiedInfo').innerHTML = 
                '<strong>搜索失败</strong><br><span style="color: #f38ba8;">未找到有效结果</span>';
        }
    }

    // 显示搜索步骤
    showSearchStep(stepIndex) {
        if (!window.hnsw || !window.hnsw.searchSteps || stepIndex >= window.hnsw.searchSteps.length) {
            return;
        }

        const searchStep = window.hnsw.searchSteps[stepIndex];
        this.searchStepIndex = stepIndex;

        // 更新信息显示
        document.getElementById('unifiedInfo').innerHTML = 
            `<strong>${searchStep.title}</strong><br>
             ${searchStep.description}<br>
             <small>搜索步骤 ${stepIndex + 1}/${window.hnsw.searchSteps.length}</small>`;

        // 可视化当前搜索步骤
        if (window.visualization) {
            window.visualization.visualizeSearchStep(searchStep);
        }
    }

    // 搜索步骤控制
    nextSearchStep() {
        if (this.isSearchMode && window.hnsw && window.hnsw.searchSteps) {
            if (this.searchStepIndex < window.hnsw.searchSteps.length - 1) {
                this.showSearchStep(this.searchStepIndex + 1);
                this.updateSearchControlButtons();
            }
        }
    }

    previousSearchStep() {
        if (this.isSearchMode && window.hnsw && window.hnsw.searchSteps) {
            if (this.searchStepIndex > 0) {
                this.showSearchStep(this.searchStepIndex - 1);
                this.updateSearchControlButtons();
            }
        }
    }

    // 退出搜索模式
    exitSearchMode() {
        this.isSearchMode = false;
        this.searchStepIndex = 0;
        
        // 回到构建演示的最后一步
        if (window.hnsw && window.hnsw.steps) {
            this.showStep(window.hnsw.steps.length - 1);
        }
        
        // 恢复正常控制按钮
        this.updateControlButtons();
        
        document.getElementById('unifiedInfo').innerHTML = 
            '<strong>退出搜索模式</strong><br>返回到索引构建演示';
    }

    // 重置步骤到开始
    resetSteps() {
        this.currentStepIndex = 0;
        this.showStep(0);
        this.updateControlButtons();
    }

    // 更新搜索控制按钮
    updateSearchControlButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const playBtn = document.getElementById('playBtn');
        const resetBtn = document.getElementById('resetBtn');

        if (window.hnsw && window.hnsw.searchSteps) {
            prevBtn.disabled = this.searchStepIndex === 0;
            nextBtn.disabled = this.searchStepIndex === window.hnsw.searchSteps.length - 1;
            
            // 在搜索模式下，播放按钮变为"退出搜索"
            playBtn.textContent = '退出搜索';
            playBtn.onclick = () => this.exitSearchMode();
            
            // 重置按钮在搜索模式下变为"重新搜索"
            resetBtn.textContent = '重新搜索';
            resetBtn.onclick = () => this.searchNode();
        }
    }

    // 处理画布点击
    handleCanvasClick(event) {
        if (!window.visualization || !window.visualization.scene || !window.visualization.camera) {
            return;
        }

        try {
            // 获取鼠标位置
            const mouse = new THREE.Vector2();
            const rect = event.target.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            // 执行射线检测
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, window.visualization.camera);
            
            const intersects = raycaster.intersectObjects(window.visualization.nodes);
            
            if (intersects.length > 0) {
                const clickedNode = intersects[0].object;
                if (clickedNode.userData && clickedNode.userData.id !== undefined) {
                    this.showNodeInfo(clickedNode.userData.id);
                }
            } else {
                // 点击空白处隐藏节点信息
                document.getElementById('nodeInfo').style.display = 'none';
            }
        } catch (error) {
            console.warn('处理画布点击时出错:', error);
        }
    }

    // 显示节点信息
    showNodeInfo(nodeId) {
        if (!window.hnsw || !window.hnsw.nodes) return;

        const node = window.hnsw.nodes.find(n => n.id === nodeId);
        if (!node) return;

        const nodeInfo = document.getElementById('nodeInfo');
        const nodeDetails = document.getElementById('nodeDetails');
        
        let neighborsInfo = '';
        for (let layer = 0; layer < node.neighbors.length; layer++) {
            const layerNeighbors = node.neighbors[layer];
            if (layerNeighbors && layerNeighbors.length > 0) {
                neighborsInfo += `第${layer}层邻居: ${layerNeighbors.map(n => n.id).join(', ')}<br>`;
            }
        }

        nodeDetails.innerHTML = `
            <strong>节点 ${nodeId}</strong><br>
            位置: (${node.vector.map(v => v.toFixed(2)).join(', ')})<br>
            层数: ${node.layers.length}<br>
            ${neighborsInfo}
        `;
        
        nodeInfo.style.display = 'block';
        
        // 5秒后自动隐藏
        setTimeout(() => {
            nodeInfo.style.display = 'none';
        }, 5000);
    }

    // 处理键盘按键
    handleKeyPress(event) {
        switch(event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                this.previousStep();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.nextStep();
                break;
            case ' ':
                event.preventDefault();
                if (this.isPlaying) {
                    this.pauseAnimation();
                } else {
                    this.playAnimation();
                }
                break;
            case 'r':
            case 'R':
                event.preventDefault();
                this.initializeHNSW();
                break;
        }
    }
}

// 全局函数 - 用于HTML按钮调用
function initializeHNSW() {
    try {
        if (window.demo) {
            window.demo.initializeHNSW();
        } else {
            console.error('演示实例未初始化');
        }
    } catch (error) {
        console.error('初始化HNSW时出错:', error);
    }
}

function nextStep() {
    try {
        if (window.demo) {
            window.demo.nextStep();
        } else {
            console.error('演示实例未初始化');
        }
    } catch (error) {
        console.error('下一步操作出错:', error);
    }
}

function previousStep() {
    try {
        if (window.demo) {
            window.demo.previousStep();
        } else {
            console.error('演示实例未初始化');
        }
    } catch (error) {
        console.error('上一步操作出错:', error);
    }
}

function playAnimation() {
    try {
        if (window.demo) {
            window.demo.playAnimation();
        } else {
            console.error('演示实例未初始化');
        }
    } catch (error) {
        console.error('播放动画出错:', error);
    }
}

function pauseAnimation() {
    try {
        if (window.demo) {
            window.demo.pauseAnimation();
        } else {
            console.error('演示实例未初始化');
        }
    } catch (error) {
        console.error('暂停动画出错:', error);
    }
}

function resetDemo() {
    try {
        if (window.demo) {
            // 重置演示并根据当前参数重新初始化
            window.demo.initializeHNSW();
        } else {
            console.error('演示实例未初始化');
        }
    } catch (error) {
        console.error('重置演示出错:', error);
    }
}

function searchNode() {
    try {
        if (window.demo) {
            window.demo.searchNode();
        } else {
            console.error('演示实例未初始化');
        }
    } catch (error) {
        console.error('搜索节点出错:', error);
    }
}

// 标签切换功能
function switchTab(tabName) {
    try {
        // 移除所有标签的active类
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 隐藏所有标签内容
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        
        // 激活当前标签
        document.getElementById(tabName + 'Tab').classList.add('active');
        document.getElementById(tabName + 'Content').classList.remove('hidden');
        
    } catch (error) {
        console.error('切换标签出错:', error);
    }
}

// 保持向后兼容的空函数
function toggleStepPanel() {
    // 简化后的面板不需要切换功能
}

function toggleStepOverlay() {
    // 简化后的面板不需要切换功能
}

// 页面加载完成后初始化演示
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM内容加载完成，开始初始化演示...');
    
    // 确保Three.js完全加载
    setTimeout(() => {
        try {
            window.demo = new HNSWDemo();
            
            // 添加使用说明
            console.log('HNSW演示页面已初始化');
            console.log('使用说明:');
            console.log('- 点击"下一步"逐步演示构建过程');
            console.log('- 使用"播放"按钮自动演示');
            console.log('- 在右侧输入节点ID进行搜索演示');
            console.log('- 点击3D场景中的节点查看详细信息');
            console.log('- 键盘控制: 左右箭头切换步骤, 空格播放/暂停, R重置');
        } catch (error) {
            console.error('初始化演示时出错:', error);
        }
    }, 500);
});

// 添加错误处理
window.addEventListener('error', (event) => {
    console.error('演示页面错误:', event.error);
});