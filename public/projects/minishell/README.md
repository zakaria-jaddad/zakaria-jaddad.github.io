# Minishell — A Unix Shell in C

![Language](https://img.shields.io/badge/Language-C-00599C?style=flat&logo=c&logoColor=white)
![School](https://img.shields.io/badge/School-42-000000?style=flat)
![Shell](https://img.shields.io/badge/Type-Unix%20Shell-blue?style=flat)
![Status](https://img.shields.io/badge/Status-Completed-success?style=flat)

**Minishell** is a simplified implementation of a Unix shell, developed as part of the 42 School curriculum. It replicates core functionalities of `bash` while offering a controlled environment to explore process management, command parsing, file descriptors, and signal handling in C.

---

## Overview

The shell reads commands with GNU Readline, parses them into tokens, builds an Abstract Syntax Tree (AST), and executes the command graph. It supports pipes, redirections, environment variable expansion, here-documents, logical operators, built-in commands, and signal handling.

This version achieved a **full score** and includes several bonus features beyond the mandatory requirements.

---

## Features

### Mandatory
- **Command Execution** — built-in and external commands with multiple arguments.
- **Redirections** — input `<`, output `>`, and append `>>`.
- **Pipes** — multiple chained commands using `\|`.
- **Environment Variables** — `$VAR` expansion based on the current environment.
- **Quotes** — handling of single `'` and double `"` quotes.
- **Built-ins** — `echo`, `cd`, `pwd`, `export`, `unset`, `env`, `exit`
- **Signal Handling** — `Ctrl+C`, `Ctrl+\`, `Ctrl+D`
- **Error Management** — syntax checks, file descriptor cleanup, and memory leak prevention.

### Bonus
- **Logical Operators** — `&&` and `||`
- **Here-Documents** — `<<` delimiter with optional expansion control
- **Wildcard Expansion** — `*` globbing with directory traversal
- **`export KEY+=value`** append syntax
- **Bash-like Redirection Ordering** — e.g., `> file cmd args`

---

## Approach & Architecture

The parser follows a clear pipeline:

1. **Tokenization** — split input into a linked list of tokens (operators, words, quotes, spaces).
2. **Syntax Check** — validate token order, quotes, parentheses, pipes, redirections, and logical operators.
3. **Pre-AST** — reorder bash-style redirections and collect heredoc input into temporary files.
4. **AST Construction** — build a binary tree using precedence: `&&`/`||` > `\|` > redirections > commands.
5. **Execution** — recursively walk the AST, fork for pipes and external commands, and run built-ins in the parent.

### Key Implementation Details
- **Heredocs** are collected by forking a child that reads with `readline("> ")` and writes to a temporary file in `/tmp/`.
- **Expansion** is performed in two passes: first `$VAR`, `$?`, and special parameters, then `*` wildcard globbing.
- **Redirections** follow bash semantics: the last in/out fd is used, and stdin/stdout are restored in the parent.
- **Built-ins** run in the parent process unless they appear inside a pipe.

---

## Build & Run

### Compile
```bash
make
```

### Run
```bash
./ft_minishell
```

You will see the prompt:
```
ft_minishell ->
```

### Example Session
```bash
ft_minishell -> echo "Hello World"
Hello World
ft_minishell -> ls -la | grep .c
ft_minishell -> cat << EOF
> line 1
> line 2
> EOF
```

### Makefile Targets
- `make` — build the shell
- `make clean` — remove object files
- `make fclean` — remove object files and binary
- `make re` — rebuild from scratch

---

## What I Learned

- Low-level Unix process control: `fork`, `execve`, `wait`, `pipe`, `dup2`, file descriptors.
- Why a shell needs tokenization → validation → AST → execution.
- How to implement a recursive parser and precedence-based tree construction.
- Signal semantics with interactive terminals and GNU Readline.
- Edge cases in redirections, heredocs, quoting, and word expansion.
- Memory management in a long-running process and careful cleanup of linked lists, ASTs, and temp files.

---

## Authors

- [Zakaria Jaddad](https://github.com/zakaria-jaddad)
- [Mouad Ait El Aouad](https://github.com/LawKmu/)
