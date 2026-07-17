player = pygame.image.load("blob.png")
x = 100
y = 72
running = True
while running:
    keys = pygame.key.get_pressed()
    if keys[pygame.K_LEFT]:
        x -= 2
    if keys[pygame.K_RIGHT]:
        x += 2
    cls(1)
    screen.blit(player, (x, y))
    clock.tick(60)
