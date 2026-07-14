# Philosophers — Dining Philosophers Problem

![Language](https://img.shields.io/badge/Language-C-00599C?style=flat&logo=c&logoColor=white)
![School](https://img.shields.io/badge/School-42-000000?style=flat)
![Concurrency](https://img.shields.io/badge/Topic-Concurrency-purple?style=flat)
![Status](https://img.shields.io/badge/Status-Completed-success?style=flat)

**Philosophers** is the classic dining philosophers problem from the 42 School curriculum. It simulates philosophers sitting at a round table who alternate between eating, sleeping, and thinking, with the goal of avoiding starvation and deadlock.

---

## Overview

Each philosopher needs two forks to eat. The simulation ends as soon as one philosopher starves, or optionally when every philosopher has eaten a specified number of times.

The repository contains two implementations:

- **Mandatory (`philo/`)** — threads + mutexes
- **Bonus (`philo_bonus/`)** — processes + POSIX named semaphores

---

## Features

### Mandatory
- One `pthread_t` per philosopher plus a monitor thread.
- One mutex per fork plus extra mutexes protecting shared state.
- Death detection and optional meal-limit completion.
- Input validation and staggered starts to reduce contention.

### Bonus
- Each philosopher runs as a separate child process created with `fork()`.
- Inter-process synchronization through a counting semaphore for forks and named semaphores for shared state.
- Each child process has its own observer thread monitoring that philosopher.

---

## Approach & Architecture

### Mandatory — Threads + Mutexes
- Each philosopher picks up their left and right fork mutexes to eat.
- A monitor thread periodically checks `last_meal_time` under a lock to detect death.
- Even-numbered philosophers sleep briefly before starting to stagger fork acquisitions and reduce deadlock risk.

### Bonus — Processes + Semaphores
- A single counting semaphore represents all available forks.
- Each child creates its own named semaphores for `last_meal_time`, `done_eating`, and a `dead` flag.
- The parent waits with `waitpid(-1, ...)` and stops remaining children when one exits abnormally.

### Input
```bash
./philo <num_philosophers> <time_to_die> <time_to_eat> <time_to_sleep> [meals_required]
```

---

## Build & Run

### Mandatory
```bash
cd philo
make
./philo 5 800 200 200
```

### Bonus
```bash
cd philo_bonus
make
./philo_bonus 5 800 200 200
```

### Makefile Targets
- `make` — build the program
- `make clean` — remove object files
- `make fclean` — remove object files and binary

---

## What I Learned

- Fundamentals of POSIX threads: `pthread_create`, `pthread_detach`, `pthread_join`, mutex lock/unlock.
- How to protect shared memory and avoid race conditions using mutexes.
- Deadlock awareness and practical mitigation techniques.
- Process management with `fork`, `waitpid`, and signals.
- POSIX named semaphores: `sem_open`, `sem_wait`, `sem_post`, `sem_close`, `sem_unlink`.
- Differences between mutexes (intra-process) and semaphores (inter-process).
- Time measurement with `gettimeofday` and precise sleeping with `usleep` loops.
- The importance of cleanup and consistent lock ordering.

---

## Author

- [Zakaria Jaddad](https://github.com/zakaria-jaddad)
