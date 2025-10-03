# AI Use Declaration

This folder records the use of AI tools in our code.

## Usage

> [!IMPORTANT]
> Only applies to chats within GitHub Copilot for VS Code.


1. Export Chat from VS Code
   1. Open the Command Palette (Cmd+Shift+P on macOS or Ctrl+Shift+P on Windows/Linux)
   2. Select "Chat: Export Chat".
   3. Save the JSON file.

2. Convert to Markdown

```bash
python3 chat_to_markdown.py chat.json chat.md
```

3. Paste the output into `usage-log.md`.

## Attributions

[Copilot Chat to Markdown by peckjon](https://github.com/peckjon/copilot-chat-to-markdown) is used to convert the chat logs in Markdown.
