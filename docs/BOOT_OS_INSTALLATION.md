# Documentation d'Installation Bootable (FazerOS Live OS)

FazerOS étant développé comme une application de bureau native (Electron/React), l'exécution de cet environnement "sur le métal" (bare-metal) nécessite de l'encapsuler dans un système d'exploitation minimaliste basé sur le noyau Linux (Debian).

Cette procédure explique comment générer et installer une image ISO Bootable (Live CD/USB) incluant :
- Le Bootloader (GRUB) compatible BIOS Legacy et UEFI
- Le noyau Linux (Kernel)
- L'Initramfs
- Le système d'affichage X11 (Mode Kiosk)
- FazerOS exécuté automatiquement au démarrage

## 1. Prérequis pour la Génération de l'ISO

La génération de l'ISO nécessite un environnement Linux natif (Ubuntu, Debian) ou WSL (Windows Subsystem for Linux).
Vous devez avoir les outils suivants installés :

```bash
sudo apt-get update
sudo apt-get install live-build xorriso mtools squashfs-tools debootstrap
```

## 2. Compilation de FazerOS

Avant de générer l'OS, vous devez compiler FazerOS sous forme de paquet natif Debian (`.deb`).
Depuis votre projet sous environnement Linux ou WSL :

```bash
# Installez les dépendances Node
npm install

# Compilez le projet et l'application (Ceci va générer un .deb dans le dossier release/)
npm run build:app
```

*Note : Le fichier `package.json` a été mis à jour pour cibler explicitement la création de paquets `.deb` dans l'attribut `linux.target`.*

## 3. Génération de l'ISO Bootable

Le script `os-builder/build-iso.sh` automatise entièrement la création de l'OS.

```bash
# Allez dans le répertoire os-builder
cd os-builder

# Exécutez le script en tant que root (requis par debootstrap et live-build)
sudo ./build-iso.sh
```

**Que fait ce script ?**
1. Télécharge un système de fichiers racine minimal (`rootfs`) basé sur Debian Bookworm.
2. Installe le noyau Linux (`linux-image-amd64`) et les modules essentiels pour gérer les périphériques block (SATA/NVMe).
3. Injecte le paquet `.deb` FazerOS généré précédemment.
4. Installe `nodm` (un gestionnaire de session ultra-léger) et configure un environnement `X11` pour démarrer FazerOS automatiquement en plein écran sans shell intermédiaire (Mode Kiosk).
5. Compile le tout avec `mksquashfs` et construit une image hybride `ISO` avec `GRUB` configuré pour l'amorçage.

Une fois terminé, un fichier `live-image-amd64.hybrid.iso` sera disponible.

## 4. Tests en Environnement Virtuel (QEMU / VirtualBox)

Avant de flasher l'ISO sur une clé USB, testez-la dans une machine virtuelle pour valider le démarrage et les contrôleurs disques virtuels.

### Via QEMU (Recommandé)

Pour tester en mode **BIOS (Legacy)** :
```bash
qemu-system-x86_64 -m 2048 -cdrom os-builder/fazeros-bootable.iso -vga virtio -accel kvm
```

Pour tester en mode **UEFI** (nécessite le paquet `ovmf`) :
```bash
qemu-system-x86_64 -m 2048 -cdrom os-builder/fazeros-bootable.iso -bios /usr/share/ovmf/OVMF.fd -vga virtio -accel kvm
```

### Via VirtualBox
1. Créez une nouvelle VM (Type: Linux, Version: Debian 64-bit).
2. Allouez au moins 2 Go de RAM.
3. Dans "Stockage", insérez l'ISO dans le lecteur optique virtuel.
4. Dans "Système", vous pouvez cocher/décocher "Activer l'EFI" pour tester les deux modes de démarrage.

## 5. Installation Physique (Bare-Metal)

Pour exécuter FazerOS sur un véritable ordinateur physique :

1. Flashez l'ISO sur une clé USB (utiliser Rufus ou BalenaEtcher sous Windows, ou `dd` sous Linux) :
   ```bash
   sudo dd if=os-builder/fazeros-bootable.iso of=/dev/sdX bs=4M status=progress
   ```
   *(Remplacez `/dev/sdX` par l'identifiant de votre clé USB).*

2. Insérez la clé USB dans l'ordinateur cible.
3. Accédez au menu de démarrage de la carte mère (F12, F8, F11, Esc selon le constructeur).
4. Sélectionnez la clé USB. GRUB se chargera, puis le noyau Linux, l'initramfs, et enfin l'interface graphique de FazerOS apparaîtra sans demander de mot de passe de connexion.

## Architecture du système généré

- **Bootloader** : `grub-pc` / `grub-efi-amd64`
- **Init System** : `systemd`
- **Display Server** : Serveur X minimal (`xserver-xorg`) avec `nodm` en auto-login.
- **Réseau** : Les paquets réseaux de base (`net-tools`, `iputils-ping`, `nmap`) sont pré-installés dans l'ISO pour que les applications internes de FazerOS (PortScanner, NetworkAnalyzer) fonctionnent nativement en interagissant avec l'OS sous-jacent.
