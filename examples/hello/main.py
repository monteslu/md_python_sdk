# hello: the smallest real Genesis game - no assets, just shapes.
# The screen is 320x224. cls clears it; print and the shape calls draw on top.
# Colors are PICO-8-style indices 0-15 (0 black, 1 dark-blue, 10 yellow, 14 pink).
import pygame

pygame.init()
screen = pygame.display.set_mode((320, 224))
clock = pygame.time.Clock()

running = True
while running:
    cls(1)                              # dark blue background

    print("hello python", 116, 32, 14)  # title text, pink, near the top

    # a smiley face, drawn entirely with shapes
    circfill(128, 80, 44, 10)           # head: a big yellow circle
    rectfill(112, 60, 120, 74, 0)       # left eye: a black square
    rectfill(136, 60, 144, 74, 0)       # right eye
    circfill(128, 98, 13, 0)            # mouth: a black circle

    clock.tick(60)
