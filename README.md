# Drop path for Paseo

Drag a file or folder onto the Paseo message box and get its local path in the message, instead of waiting for an upload. Handy for big files, video, whole project folders.

## Install

```bash
paseo plugin add themattvision/paseo-drop-path
```

Requires Paseo 0.13.0 or later, desktop app on macOS. If a drop still uploads after installing, reload the Paseo window (Cmd+R).

## How it behaves

- One or many files and folders dropped together: one path each, separated by a space.
- Paths with spaces are wrapped in double quotes.
- Terminal, file explorer and file view are left alone.
- If the path cannot be resolved, Paseo uploads the file as usual.
- The path is the one on the machine running the app, so it is useful when the agent runs on that same Mac.

## Made by

Matteo Zampieri, "lo smanettone di fiducia": Italian AI content creator and developer. I show how to use AI and Claude Code for real work, in Italian, on Instagram [@themattvision](https://instagram.com/themattvision).

More tools, guides and projects at [matteozampieri.com](https://matteozampieri.com).

## License

MIT
