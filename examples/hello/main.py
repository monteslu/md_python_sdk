import pygame

pygame.init()
screen = pygame.display.set_mode((320, 224))
clock = pygame.time.Clock()

x = 100
y = 80
vx = 2

running = True
while running:
    if btn(0):
        x -= 2
    if btn(1):
        x += 2
    x += vx
    if x > 220:
        vx = -2
    if x < 20:
        vx = 2
    cls(1)
    rectfill(x, y, x + 16, y + 16, 10)
    print("hello python", 80, 20, 7)
    clock.tick(60)
