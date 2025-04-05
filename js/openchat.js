class ChatWidget {
    constructor(wsUrl) {
        this.wsUrl = wsUrl;
        this.ws = null;
        this.isExpanded = false;
        this.messageHandlers = {
            send: this.defaultSendHandler.bind(this),
            receive: this.defaultReceiveHandler.bind(this)
        };
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.sessionId = crypto.randomUUID(); // 添加这行
        this.init();
    }

    init() {
        // 创建主容器
        this.container = document.createElement('div');
        this.container.className = 'fixed bottom-4 right-4 z-50';
        document.body.appendChild(this.container);

        // 创建图标状态的UI
        this.createIconUI();

        // 创建聊天界面的UI
        this.createChatUI();

        // 初始显示图标状态
        this.toggleState(false);
    }

    createIconUI() {
        this.iconContainer = document.createElement('div');
        this.iconContainer.className = 'w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors';
        // this.iconContainer.innerHTML = `
        //     <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        //         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
        //     </svg>
        // `;
        this.iconContainer.innerHTML = `
            <img src="https://afoo.me/hero3/70.webp" alt="fairy" class="w-20 h-auto">
        `;
        this.iconContainer.addEventListener('click', () => this.toggleState(true));
        this.container.appendChild(this.iconContainer);
    }

    createChatUI() {
        this.chatContainer = document.createElement('div');
        this.chatContainer.className = 'hidden bg-white rounded-lg shadow-lg flex flex-col md:w-[30rem] md:h-[80vh] fixed md:static inset-0 md:inset-auto';
        this.chatContainer.innerHTML = `
            <div class="flex justify-between items-center p-4 border-b">
                <h3 class="font-semibold flex justify-center items-center"><img src="https://afoo.me/hero3/70.webp" alt="fairy" class="w-20 h-auto"><span>有什么可以帮助您？/ May I help you?</span></h3>
                <button class="text-gray-500 hover:text-gray-700" id="minimizeBtn">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>
            <div class="flex-1 p-4 overflow-y-auto" id="messageContainer"></div>
            <div class="border-t p-4">
                <div class="flex">
                    <input type="text" class="flex-1 border rounded-l px-3 py-2 focus:outline-none focus:border-blue-500" placeholder="Type a message..." id="messageInput">
                    <button class="bg-blue-500 text-white px-4 rounded-r hover:bg-blue-600" id="sendBtn">Send</button>
                </div>
            </div>
        `;
        this.container.appendChild(this.chatContainer);

        // 绑定事件
        this.chatContainer.querySelector('#minimizeBtn').addEventListener('click', () => this.toggleState(false));
        this.chatContainer.querySelector('#sendBtn').addEventListener('click', () => this.sendMessage());
        this.chatContainer.querySelector('#messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    toggleState(expand) {
        this.isExpanded = expand;
        if (expand) {
            this.iconContainer.classList.add('hidden');
            this.chatContainer.classList.remove('hidden');
            this.connectWebSocket();
        } else {
            this.iconContainer.classList.remove('hidden');
            this.chatContainer.classList.add('hidden');
            this.disconnectWebSocket();
        }
    }

    connectWebSocket() {
        if (this.ws?.readyState === WebSocket.OPEN) return;

        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.reconnectAttempts = 0;
        };

        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
            if (this.isExpanded) this.reconnect();
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        this.ws.onmessage = (event) => {
            this.messageHandlers.receive(event.data);
        };
    }

    reconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Max reconnection attempts reached');
            return;
        }

        setTimeout(() => {
            this.reconnectAttempts++;
            console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
            this.connectWebSocket();
        }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1));
    }

    disconnectWebSocket() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    sendMessage() {
        const input = this.chatContainer.querySelector('#messageInput');
        const message = input.value.trim();
        if (!message) return;

        this.messageHandlers.send(message);
        input.value = '';
    }

    // 默认消息发送处理函数
    defaultSendHandler(message) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            const messageData = {
                uuid: this.sessionId,
                message: message
            };
            this.ws.send(JSON.stringify(messageData));
            this.appendMessage('outgoing', message);
        }
    }

    // 默认消息接收处理函数
    defaultReceiveHandler(message) {
        this.appendMessage('incoming', message);
    }

    // 设置自定义消息处理函数
    setMessageHandlers(handlers) {
        this.messageHandlers = {
            ...this.messageHandlers,
            ...handlers
        };
    }

    appendMessage(type, content) {
        const messageContainer = this.chatContainer.querySelector('#messageContainer');
        const messageElement = document.createElement('div');
        messageElement.className = `mb-4 ${type === 'outgoing' ? 'text-left' : 'text-right'}`;
        messageElement.innerHTML = `
            <div class="${type === 'outgoing' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} inline-block px-4 py-2 rounded-lg max-w-[80%]">
                ${content}
            </div>
        `;
        messageContainer.appendChild(messageElement);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }
}