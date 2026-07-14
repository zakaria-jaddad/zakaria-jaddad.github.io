# cub3D — Raycasting Game Engine

![Language](https://img.shields.io/badge/Language-C-00599C?style=flat&logo=c&logoColor=white)
![School](https://img.shields.io/badge/School-42-000000?style=flat)
![Graphics](https://img.shields.io/badge/Graphics-MLX42-purple?style=flat)
![Status](https://img.shields.io/badge/Status-Completed-success?style=flat)

**cub3D** is a first-person 3D maze exploration game inspired by the classic *Wolfenstein 3D*. Developed as part of the 42 School curriculum, it turns a simple 2D grid map into an immersive 3D perspective using a custom raycasting engine built from scratch in C.

This project was a collaborative effort between **Larhrib Ismail** and **Zakaria Jaddad**.

---

## Overview

The program reads a `.cub` scene description file, validates the map and configuration, then renders a textured 3D world in real time. Players can move through the maze, rotate the camera, and interact with doors and other bonus features.

The rendering core is a classic **DDA (Digital Differential Analysis) raycaster** with a camera-plane model, implemented using the **MLX42** graphics library.

---

## Features

### Mandatory Part
- **DDA Raycasting Engine** — renders a 3D perspective from a 2D grid map.
- **Textured Walls** — separate textures for North, South, East, and West facing walls.
- **Custom Colors** — configurable RGB colors for the floor and ceiling.
- **Smooth Movement** — fluid player movement and camera rotation.
- **Wall Collision** — bounding-box based collision detection.
- **Robust Map Parsing** — strict validation of `.cub` files with detailed error handling.
- **Clean Window Management** — exit via `ESC`, `Q`, or the window close button.

### Bonus Part
- **Minimap** — real-time 2D radar showing the player position and surroundings.
- **Mouse Look** — rotate the camera by moving the mouse.
- **Interactive Doors** — open and close doors with `O` and `C`.
- **Sky Texture** — rotating skybox based on player yaw.
- **POV Overlay** — first-person overlay with head-bobbing while walking.

---

## Approach & Architecture

### Raycasting Pipeline
1. **Map Parsing** — the `.cub` file is split into a header section (textures, colors) and a 2D map grid. The parser validates file extension, texture paths, RGB colors, map closure, and exactly one player start.
2. **Player Setup** — the player position and direction vector are initialized from the start orientation (`N`, `S`, `E`, `W`).
3. **Per-Frame Render** — for each screen column, a ray is cast into the grid using DDA until it hits a wall or closed door.
4. **Wall Projection** — the perpendicular wall distance determines the stripe height, which is then textured and drawn to the screen.
5. **Bonus Overlay** — the minimap, sky texture, and POV overlay are rendered on top of the 3D view.

### Key Technologies
- **Language:** C
- **Graphics:** MLX42
- **Build:** Make
- **Screen constants:** 1000×800

---

## Build & Run

> **Note:** The Makefile contains a hardcoded path to `libmlx42.a`:
> ```makefile
> LIB_PATH = /mnt/homes/zajaddad/.local/lib/MLX42/build/libmlx42.a
> ```
> You may need to update this path on your own machine.

### Prerequisites
- Unix-based system (Linux / macOS)
- `gcc` or `cc` and `make`
- MLX42 library and GLFW installed

### Compilation
```bash
# Mandatory version
make

# Bonus version
make bonus
```

### Execution
```bash
./cub3D maps/map.cub
./cub3D_bonus maps/map_bonus.cub
```

### Makefile Targets
- `make` — compile the mandatory program
- `make bonus` — compile with bonus features
- `make clean` — remove object files
- `make fclean` — remove object files and executables
- `make re` — rebuild from scratch

---

## Controls

| Key | Action |
| :-: | :--- |
| `W` | Move forward |
| `S` | Move backward |
| `A` | Strafe left |
| `D` | Strafe right |
| `←` / `→` | Rotate camera |
| `ESC` / `Q` | Quit |
| `O` | Open adjacent door *(bonus)* |
| `C` | Close adjacent door *(bonus)* |
| `Mouse` | Look around *(bonus)* |

---

## What I Learned

- How a **DDA raycaster** translates a 2D grid into a convincing 3D perspective.
- Coordinate transformations between grid space and projected screen space.
- Texture mapping, wall clipping, and per-pixel rendering with MLX42.
- Event-driven input handling and frame-based game loops.
- Robust parsing: tokenizing, validation, error reporting, and memory cleanup.
- Collision detection using a simple bounding-box approach.
- How to separate a mandatory and bonus codebase while sharing core logic.

---

## Authors

- [Larhrib Ismail](https://github.com/NotSphyynxx)
- [Zakaria Jaddad](https://github.com/zakaria-jaddad)
