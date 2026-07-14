# Libft — Custom C Standard Library

![Language](https://img.shields.io/badge/Language-C-00599C?style=flat&logo=c&logoColor=white)
![School](https://img.shields.io/badge/School-42-000000?style=flat)
![Type](https://img.shields.io/badge/Type-Static%20Library-orange?style=flat)
![Status](https://img.shields.io/badge/Status-Completed-success?style=flat)

**Libft** is the first project in the 42 School / 1337 Khouribga curriculum. It is a from-scratch reimplementation of a subset of the C standard library, plus additional utility functions, packaged as a static library (`libft.a`).

---

## Overview

The goal of Libft is to rebuild common libc functions manually without relying on most standard functions, then package them into a reusable static library. The project is split into three parts:

1. **Mandatory Part 1** — libc reimplementations
2. **Mandatory Part 2** — additional string, memory, and utility functions
3. **Bonus Part** — singly linked list utilities

---

## Features

### Character Classification
`ft_isalpha`, `ft_isdigit`, `ft_isalnum`, `ft_isascii`, `ft_isprint`, `ft_toupper`, `ft_tolower`

### String Manipulation
`ft_strlen`, `ft_strlcpy`, `ft_strlcat`, `ft_strchr`, `ft_strrchr`, `ft_strncmp`, `ft_strnstr`, `ft_strdup`

### Memory Manipulation
`ft_memset`, `ft_bzero`, `ft_memcpy`, `ft_memmove`, `ft_memchr`, `ft_memcmp`, `ft_calloc`

### Conversion
`ft_atoi`, `ft_itoa`

### Additional String Utilities
`ft_substr`, `ft_strjoin`, `ft_strtrim`, `ft_split`, `ft_strmapi`, `ft_striteri`

### File Descriptor I/O
`ft_putchar_fd`, `ft_putstr_fd`, `ft_putendl_fd`, `ft_putnbr_fd`

### Linked List (Bonus)
`ft_lstnew`, `ft_lstadd_front`, `ft_lstadd_back`, `ft_lstsize`, `ft_lstlast`, `ft_lstdelone`, `ft_lstclear`, `ft_lstiter`, `ft_lstmap`

---

## Approach & Implementation

- **Byte-by-byte memory operations** using `unsigned char *` casts for precise control.
- **Overlapping-safe copy** in `ft_memmove` by copying backwards when necessary.
- **BSD-compliant `ft_strlcat`** returning `dest_len + src_len` and avoiding buffer overflows.
- **Overflow-aware `ft_atoi`** detecting integer overflow before it happens.
- **Two-pass `ft_split`** first counts words, then extracts each word with cleanup on allocation failure.
- **Generic linked list** using `void *` content and function pointers for deletion/transformation.

---

## Build & Run

### Compile the Library
```bash
make         # mandatory functions
make bonus   # include linked-list functions
make clean   # remove object files
make fclean  # remove object files and libft.a
make re      # full rebuild
```

### Use in Another Project
```bash
cc your_program.c -L/path/to/libft -lft -o your_program
```

```c
#include "libft.h"
```

### Run Tests
```bash
cd test
make
```

---

## What I Learned

- Core C concepts: pointers, pointer arithmetic, `const` correctness, casts, and `size_t` semantics.
- Manual memory management with `malloc`/`free` and avoiding memory leaks.
- Edge cases in standard functions: empty strings, overlapping memory, `NULL` inputs, integer limits.
- How static libraries are built with `ar` and linked into other programs.
- Makefile basics: targets, automatic variables, pattern rules, and `.PHONY`.
- The value of writing a test harness by comparing each function against the real libc.

---

## Author

- [Zakaria Jaddad](https://github.com/zakaria-jaddad)
