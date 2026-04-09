#!/bin/bash

# Script de génération d'une ISO Bootable Debian pour FazerOS
# PRÉREQUIS: Ce script doit être exécuté sous un environnement Linux (Debian/Ubuntu ou WSL) en tant que root.

set -e

if [ "$EUID" -ne 0 ]; then
  echo "Veuillez exécuter ce script en tant que root (sudo ./build-iso.sh)"
  exit 1
fi

echo "=== Préparation de l'environnement de build ISO ==="
apt-get update
apt-get install -y live-build xorriso mtools squashfs-tools debootstrap

# Créer le répertoire de travail
WORKDIR="/tmp/fazeros-iso-build"
rm -rf "$WORKDIR"
mkdir -p "$WORKDIR"
cd "$WORKDIR"

echo "=== Initialisation de live-build ==="
# Configuration pour générer un système Debian Bookworm amd64 (BIOS et UEFI compatibles)
lb config \
    --architecture amd64 \
    --distribution bookworm \
    --archive-areas "main contrib non-free non-free-firmware" \
    --binary-images iso-hybrid \
    --bootappend-live "boot=live components quiet splash loglevel=3 nodm.autologin=fazeros xorg=safe" \
    --iso-application "FazerOS" \
    --iso-publisher "FazerOS Team" \
    --iso-volume "FazerOS Live"

echo "=== Injection du paquet FazerOS ==="
mkdir -p config/packages.chroot/
# Nous supposons que le package .deb a été construit avec 'npm run build:app' sur Linux
# Copier le dernier .deb généré dans le répertoire des paquets personnalisés
if [ -f "/mnt/c/Users/Admin/Documents/trae_projects/FazerOs/release/"*.deb ]; then
    cp /mnt/c/Users/Admin/Documents/trae_projects/FazerOs/release/*.deb config/packages.chroot/
else
    echo "ATTENTION: Le package .deb FazerOS est introuvable. Avez-vous exécuté 'npm run build:app' sur un environnement Linux ?"
    # Note: On continue la compilation pour générer l'ISO de base même si FazerOS manque
fi

echo "=== Définition des dépendances système (packages) ==="
cat <<EOF > config/package-lists/my.list.chroot
# Noyau et démarrage
linux-image-amd64
live-boot
live-config
systemd
systemd-sysv

# Interface graphique minimale et Kiosk
xserver-xorg-video-all
xserver-xorg-input-all
xinit
nodm
openbox

# Outils réseaux (Pour NetworkAnalyzer et PortScanner)
iputils-ping
net-tools
traceroute
nmap
curl
wget

# Utilitaires de base
sudo
nano
bash
EOF

echo "=== Configuration du mode Kiosk (démarrage auto de FazerOS) ==="
mkdir -p config/includes.chroot/etc/nodm/
mkdir -p config/includes.chroot/home/fazeros/
mkdir -p config/includes.chroot/etc/systemd/system/

# Configuration NODM (auto-login pour l'utilisateur fazeros)
cat <<EOF > config/includes.chroot/etc/default/nodm
NODM_ENABLED=true
NODM_USER=fazeros
NODM_XSESSION=/home/fazeros/.xinitrc
NODM_X_OPTIONS='-nolisten tcp'
NODM_MIN_TIME=60
EOF

# Configuration xinitrc pour lancer FazerOS
cat <<EOF > config/includes.chroot/home/fazeros/.xinitrc
#!/bin/bash
# Désactiver la gestion d'énergie de l'écran
xset s off
xset -dpms
xset s noblank

# Lancer FazerOS en plein écran (le binaire s'appelle généralement 'fazeros' ou selon le nom dans package.json)
exec /opt/FazerOS/fazeros --no-sandbox
EOF
chmod +x config/includes.chroot/home/fazeros/.xinitrc

# Script post-installation (Hook)
mkdir -p config/hooks/normal/
cat <<EOF > config/hooks/normal/0100-setup-fazeros-user.hook.chroot
#!/bin/sh
set -e

# Création de l'utilisateur fazeros
if ! id "fazeros" >/dev/null 2>&1; then
    useradd -m -s /bin/bash fazeros
fi

# Permissions sudo sans mot de passe pour les commandes réseau
echo "fazeros ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/fazeros
chmod 0440 /etc/sudoers.d/fazeros

# S'assurer que le home lui appartient
chown -R fazeros:fazeros /home/fazeros/
EOF
chmod +x config/hooks/normal/0100-setup-fazeros-user.hook.chroot

echo "=== Compilation de l'ISO ==="
echo "Cette étape peut prendre 10 à 30 minutes selon votre connexion internet."
lb build

echo "=== Terminé ==="
if [ -f "live-image-amd64.hybrid.iso" ]; then
    echo "L'ISO bootable a été générée avec succès : $WORKDIR/live-image-amd64.hybrid.iso"
    # Copier l'ISO vers le répertoire du projet si sous WSL
    cp live-image-amd64.hybrid.iso /mnt/c/Users/Admin/Documents/trae_projects/FazerOs/os-builder/fazeros-bootable.iso || true
else
    echo "Une erreur est survenue lors de la génération de l'ISO."
fi
