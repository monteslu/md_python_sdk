# sprite: load a PNG and blit it as a hardware sprite you can move.
import pygame

pygame.init()
screen = pygame.display.set_mode((320, 224))
clock = pygame.time.Clock()

hero = pygame.image.load("blob.png")
x = 152
y = 104

running = True
while running:
    keys = pygame.key.get_pressed()
    if keys[pygame.K_LEFT]:
        x -= 2
    if keys[pygame.K_RIGHT]:
        x += 2
    if keys[pygame.K_UP]:
        y -= 2
    if keys[pygame.K_DOWN]:
        y += 2

    cls(1)
    screen.blit(hero, (x, y))
    clock.tick(60)
