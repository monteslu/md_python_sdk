# mdpy cheatsheet (Sega Genesis, 68000)

**Native resolution: 320 x 224** (H40) — `pygame.display.set_mode((320, 224))`
must use exactly this. Shape drawing (circfill/rectfill/line) uses a **256 x 160
canvas at the top-left**; sprites, print text, and blit use the full 320 x 224.

Numbers are 16.16 fixed point. Colors are PICO-8 indices 0-15. See the pycretro
SPEC and DIFFERENCES.md for the full contract.

## Program shape
```python
import pygame
pygame.init()
screen = pygame.display.set_mode((320, 224))
clock = pygame.time.Clock()
running = True
while running:
    keys = pygame.key.get_pressed()
    if keys[pygame.K_LEFT]:  ...    # d-pad
    cls(1)                          # or screen.fill((r,g,b))
    clock.tick(60)                  # the vblank wait
```

## Drawing
- `cls(c)` / `screen.fill(color)` — clear
- `rectfill(x0,y0,x1,y1,c)`, `rect(...)`, `circfill(x,y,r,c)`, `circ(...)`, `line(...)`, `pset(x,y,c)`
- `print(text, x, y, c)` — text; f-strings supported: `print(f"score {s}", 8, 8, 7)`
- `img = pygame.image.load("sprite.png")` then `screen.blit(img, (x, y))` — hardware sprite

## Input
`keys = pygame.key.get_pressed()` then `keys[pygame.K_LEFT|K_RIGHT|K_UP|K_DOWN|K_z|K_x|K_RETURN]`

## Rect
`r = pygame.Rect(x, y, w, h)` — fields `r.x/y/w/h`, anchors `r.centerx/right/...`,
`r.colliderect(other)`, `r.collidepoint(x, y)`

## Classes
```python
class Player:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    def move(self, dx):
        self.x += dx
```

## Math
`abs min max flr sqrt sin cos atan2 rnd`

## Audio
- `pygame.mixer.music.load("song")` + `pygame.mixer.music.play(-1)` (loop) / `.stop()`
- `snd = pygame.mixer.Sound("blip")` then `snd.play()`
- With no `music.load`, `music.play(-1)` plays the built-in tune.

## Sprite groups
```python
class Enemy(pygame.sprite.Sprite):
    def __init__(self):
        self.x = 0
        self.y = 0
    def update(self):
        self.y += 1

enemies = pygame.sprite.Group(Enemy, 32)   # fixed-capacity pool of ONE class
enemies.add()            # spawn one (runs __init__)
enemies.update()         # calls each sprite's update()
enemies.draw(screen)     # blits each sprite at its x,y
```
