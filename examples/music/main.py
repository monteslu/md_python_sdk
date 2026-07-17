import pygame
pygame.init()
screen = pygame.display.set_mode((320, 224))
clock = pygame.time.Clock()

pygame.mixer.music.play(-1)   # built-in demo tune, looped

running = True
while running:
    cls(1)
    print("music playing", 120, 100, 10)
    clock.tick(60)
