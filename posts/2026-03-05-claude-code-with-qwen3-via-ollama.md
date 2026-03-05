% claude code with qwen3.5 via ollama
% 王福强
% 2026-03-05


`ollama run qwen3.5:9b`然后：


```
curl http://localhost:11434/api/chat \
  -d '{
    "model": "qwen3.5:9b",
    "messages": [{"role": "user", "content": "tell me a joke"}],
    "stream": false
  }'
```

不过这种情况下，thinking mode太耗时间：

```bash
## 这种方式只是过滤输出，但thinking过程依然存在，只是不显示，所以时长该在还在。
🍀 LuckyJohn💫 af:~/ $ curl http://localhost:11434/api/chat \                                                                                                                                            [12:01:58]
  -d '{
   "model": "qwen3.5:9b",
   "messages": [{"role": "user", "content": "tell me a joke"}],
        "options": {
                "stop": ["<thought>", "</thought>"],
                "temperature": 0.7
        },
   "stream": false
  }'
{"model":"qwen3.5:9b","created_at":"2026-03-05T04:05:38.453523Z","message":{"role":"assistant","content":"Why did the scarecrow win an award?\n\nBecause he was **outstanding in his field**! 🌽","thinking":"Thinking Process:\n\n1.  **Analyze the Request:**\n    *   User: \"tell me a joke\"\n    *   Intent: The user wants to hear a joke for entertainment.\n    *   Tone: Lighthearted, fun, simple, appropriate for general audiences.\n\n2.  **Select a Joke:**\n    *   Criteria: Needs to be generally understandable, not too niche, not offensive, and ideally have a clear punchline.\n    *   Option 1: A pun (e.g., \"Why did the scarecrow...\").\n    *   Option 2: A situational joke (e.g., about animals or everyday life).\n    *   Option 3: A classic short joke.\n\n    *Selection:* Let's go with a classic, clean, slightly punny one. The \"scarecrow\" joke is very popular. Or maybe the \"parallel lines\" math joke? No, let's try something about animals or daily life. How about the \"why don't scientists trust atoms?\" joke? That's a classic. Or the \"I told my wife she was drawing her eyebrows too high.\"\n\n    Let's pick a funny one-liner or a short setup-punchline.\n    *Joke:* Why did the scarecrow win an award? Because he was outstanding in his field!\n\n    *Alternative:* What do you call a fake noodle? An impasta.\n\n    *Alternative:* Parallel lines have so much in common. It's a shame they'll never meet. (Too nerdy?)\n\n    Let's go with the \"scarecrow\" one, it's safe and classic. Or maybe something slightly more conversational.\n    Actually, let's try this one:\n    \"Why don't eggs tell jokes? They'd crack each other up.\"\n\n    Let's choose a good, reliable one.\n    \"What do you call a bear with no teeth? A gummy bear.\" (Simple)\n    \"I'm on a seafood diet. I see food and I eat it.\" (Classic)\n\n    Let's go with the \"seafood\" one or the \"scarecrow\". Scarecrow is good.\n    Wait, let's try a slightly more modern/relatable one.\n    \"Why couldn't the bicycle stand up by itself? It was two tired!\"\n\n    Okay, I'll pick the \"scarecrow\" joke. It's wholesome.\n    Actually, the \"I'm on a seafood diet\" is also very common and short.\n    Let's go with the \"scarecrow\".\n\n3.  **Draft the Response:**\n    *   Deliver the joke clearly.\n    *   Keep it friendly.\n\n4.  **Review against constraints:**\n    *   No harmful content.\n    *   Short and sweet.\n\n5.  **Final Polish:**\n    \"Why did the scarecrow win an award? Because he was outstanding in his field!\"\n\n    Let's add a little emoji for flavor.\n\n    Wait, I'll offer two options or just one good one. One is usually better to avoid decision fatigue.\n    Let's go with:\n    \"I told my wife she was drawing her eyebrows too high. She looked surprised.\"\n    That's a visual pun joke, often well-received.\n\n    Okay, let's stick with the classic Scarecrow one. It's very recognizable.\n    Or the \"Parallel lines\" one is a bit dry.\n    Let's try: \"Why don't skeletons fight each other? They don't have the guts.\"\n\n    Okay, I'll go with the \"scarecrow\" joke. It's safe.\n\n    Wait, let me pick a slightly funnier one.\n    \"What do you call a factory that makes okay products? A satisfactory.\" (Too wordy)\n    \"Why did the math book look sad? Because it had too many problems.\"\n\n    Okay, I'll use the \"scarecrow\" joke. It's a crowd-pleaser.\n    Actually, let's try this one:\n    \"A man walks into a library and asks for a book on paranoia. The librarian whispers, 'There are some books in the back that might interest you...'\"\n\n    That's good. But maybe too complex.\n\n    Let's go with the simple \"scarecrow\" joke.\n    \"Why did the scarecrow win an award? Because he was outstanding in his field!\"\n\n    Okay, ready to output.cw"},"done":true,"done_reason":"stop","total_duration":79915253167,"load_duration":121717125,"prompt_eval_count":14,"prompt_eval_duration":926116750,"eval_count":978,"eval_duration":77819193917}%

## 这种方式是正常的disable掉thinking mode
🍀 LuckyJohn💫 af:~/ $ curl http://localhost:11434/api/chat \                                                                                                                                            [12:05:38]
  -d '{
   "model": "qwen3.5:9b",
   "messages": [{"role": "user", "content": "tell me a joke"}],
        "options": {
                "stop": ["<thought>", "</thought>"],
                "temperature": 0.7
        },
   "think": false,  
   "stream": false
  }'
{"model":"qwen3.5:9b","created_at":"2026-03-05T04:08:27.629941Z","message":{"role":"assistant","content":"Why don't scientists trust atoms?\n\nBecause they **make up everything**! 🤓⚛️"},"done":true,"done_reason":"stop","total_duration":2170299292,"load_duration":123259625,"prompt_eval_count":16,"prompt_eval_duration":351902542,"eval_count":23,"eval_duration":1670221332}%                                                  🍀 LuckyJohn💫 af:~/ $
```



另外，可以让claude code配合ollama一起使用：

```
ANTHROPIC_BASE_URL="http://localhost:11434" ANTHROPIC_AUTH_TOKEN="ollama" claude --model qwen3.5:9b 
```

> NOTE
> 
> 使用最新版的`ollama launch claude --model qwen3.5:9b`命令一键启动也可以，背后的机制相当于是先ollama run启动服务之后，再启动claude code。


