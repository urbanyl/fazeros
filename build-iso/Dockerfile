FROM alpine:latest

# Installation des dépendances minimales pour un environnement graphique et Chromium
RUN apk update && apk add --no-cache \
    xorg-server \
    xf86-video-vesa \
    xf86-input-libinput \
    eudev \
    mesa-dri-gallium \
    openbox \
    chromium \
    lighttpd \
    sudo

# Création d'un utilisateur sans mot de passe
RUN addgroup -S fazeros && adduser -S fazeros -G fazeros -s /bin/sh
RUN echo "fazeros ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

# Configuration du serveur web local pour héberger FazerOS
COPY dist /var/www/localhost/htdocs/

# Configuration du démarrage automatique (auto-login) et lancement de l'interface
RUN echo "startx" >> /home/fazeros/.profile

# Configuration X11 pour lancer Chromium en mode kiosque
RUN mkdir -p /home/fazeros/.config/openbox
RUN echo "lighttpd -f /etc/lighttpd/lighttpd.conf" > /home/fazeros/.xinitrc
RUN echo "chromium-browser --kiosk --no-sandbox --window-size=1920,1080 http://localhost &" >> /home/fazeros/.xinitrc
RUN echo "exec openbox-session" >> /home/fazeros/.xinitrc
RUN chown -R fazeros:fazeros /home/fazeros

# Point d'entrée pour générer l'ISO
# Note : Pour générer un vrai fichier .iso bootable depuis cette image, 
# il faut utiliser un outil de création d'ISO Live comme 'mkisofs' et 'syslinux'.
# Ce Dockerfile sert de base à la création du système de fichiers de l'OS.
CMD ["/bin/sh"]
