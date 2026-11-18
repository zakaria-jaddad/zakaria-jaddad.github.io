# push_swap — Stack Sorting Optimizer

![Language](https://img.shields.io/badge/Language-C-00599C?style=flat&logo=c&logoColor=white)
![School](https://img.shields.io/badge/School-42-000000?style=flat)
![Algorithm](https://img.shields.io/badge/Topic-Algorithm%20Optimization-purple?style=flat)
![Status](https://img.shields.io/badge/Status-Completed-success?style=flat)

**push_swap** is a 42 School algorithm project. The goal is to sort a list of integers using only two stacks (Stack A and Stack B) and a restricted set of operations, producing the shortest possible sequence of instructions.

---

## Overview

The program receives a list of integers and outputs a sequence of stack operations such as `sa`, `pb`, `ra`, etc. The operations are applied to two stacks, and the final result must be the numbers sorted in ascending order on Stack A.

A companion **checker** program (bonus) reads operations from stdin and verifies whether they correctly sort the input.

---

## Features

### Mandatory
- Sort any list of unique integers using only two stacks.
- Error handling for non-numeric input, duplicates, and integer overflow.
- Optimized instruction count for all input sizes.

### Bonus
- **Checker** program that validates a sequence of operations.
- Reads operations from stdin using `get_next_line`.
- Prints `OK`, `KO`, or `Error` depending on the result.

---

## Approach & Algorithm

The implementation uses a **hybrid strategy** that switches algorithms based on input size:

| Size | Strategy |
| :--- | :--- |
| 2 | Single swap if needed |
| 3 | Hardcoded three-number sort |
| 5 | Push two smallest to B, sort three in A, push back |
| > 5 | Pivot/chunk sort in two phases |

### Large-Sort Strategy
1. **Phase 1 — Chunk distribution to Stack B**
   - Compute dynamic pivots dividing Stack A into thirds.
   - Push smaller elements to B.
   - Middle-band elements are rotated to the bottom of B to create rough ordering.
2. **Hardcoded top-3 sort** on the remaining largest elements in A.
3. **Phase 2 — Merge back to Stack A**
   - Find the next required element in B by sorted index.
   - Rotate B in the cheaper direction, push to A, and reverse-rotate A when needed.

### Data Structures
- **Doubly linked list** nodes indexed by sorted rank rather than raw value.
- Operations: swap, push, rotate, reverse rotate (11 total).

---

## Build & Run

### Compile
```bash
make         # mandatory
make bonus   # includes checker
```

### Run push_swap
```bash
./push_swap 2 1 3 6 5 8
./push_swap "2 1 3 6 5 8"
ARG="4 67 3 87 23"; ./push_swap $ARG
```

### Run with checker
```bash
./push_swap $ARG | ./checker $ARG
```

### Makefile Targets
- `make` — build `push_swap`
- `make bonus` — build `push_swap` and `checker`
- `make clean` — remove object files
- `make fclean` — remove object files and binaries
- `make re` — rebuild from scratch

---

## What I Learned

- Stack ADTs and pointer manipulation with doubly linked lists.
- Sorting under constraints: optimizing operation count rather than time complexity.
- Pivot/chunk strategies for near-optimal sorting with limited moves.
- Rigorous input validation: parsing strings, detecting overflow, and handling duplicates.
- Memory hygiene: explicit freeing of stacks, split arrays, and library allocations.
- Separation of concerns between parsing, operations, sorting, and utilities.
- Makefile structure for multi-target builds and static library linking.

---

## Author

- [Zakaria Jaddad](https://github.com/zakaria-jaddad)
