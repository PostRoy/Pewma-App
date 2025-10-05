# Pewma APP
Esta app viene como proyecto de ingeniería de software para la universidad Diego Portales (Chile)

  ## Cómo compilar la aplicación
  
  ### Actualizar librerías
  ```bash
  apt update  
  ```
  ```bash
  apt upgrade  
  ```
  ### Descargar NodeJS y JDK25
  [JDK25](https://www.oracle.com/java/technologies/downloads/)
  ```bash
  NODE_MAJOR=24
  curl -sL https://deb.nodesource.com/setup_$NODE_MAJOR.x -o nodesource_setup.sh
  bash nodesource_setup.sh
  ```
  ```bash
  apt install nodejs -y
  ```
  
  ### Agregar git y clonar el repositorio 
  ```bash
  git clone https://github.com/PostRoy/Pewma-App.git
  ```
  ```bash
  cd Pewma-App
  ```
  ### Instalar expo y correr el cliente
  ```bash
  npm install expo
  ```
  ```bash
  npx expo start
  ```


  ## Troubleshoot
  lucide-react-native tiene problemas, al ser una versión mas vieja, requiere paquetes más viejos, los que chocan y entorpecen el proyecto
  la mejor solución es actualizar el paquete a su ultima versión para hacerlo compatible y volver a correrlo
  
  ```
  npm install lucide-react-native@latest --save
  ```
