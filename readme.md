# Pewma APP
Esta app viene como proyecto de ingeniería de software para la universidad Diego Portales (Chile)

  ## Cómo compilar la aplicación
  Se probó en Ubuntu 24.04 LTS
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

  <img width="400"  alt="image" src="https://github.com/user-attachments/assets/7749f11b-77d6-48fe-856f-9a86f63b2023" />
  Debe salir algo como esto, para ver la app hay 3 opciones
  - Web (No recomendado): No tiene mensajes de error, ni popups para parte de la funcionalidad. 
  - iOS (Recomendado): Probado en iOS 18 y 26, en iPhone 13 pro y 14, en los dos funcional, con leves detalles gráficos.
  - Android:
    

  ## Troubleshoot
  ### Problemas al instalar Expo
  lucide-react-native tiene problemas, al ser una versión mas vieja, requiere paquetes más viejos, los que chocan y entorpecen el proyecto
  la mejor solución es actualizar el paquete a su ultima versión para hacerlo compatible y volver a correrlo
  
  ```bash
  npm install lucide-react-native@latest --save
  ```
  ### Problemas expo-go iOS
  Expo-GO en iOS solo es compatible con la última versión disponible, por lo que para correrlo necesitamos actualizar el sdk

  ```bash
  npm install expo@^54.0.0
  ```
  Lo que al mismo tiempo nos lleva a otro error ya que las librerías quedan una/unas versión más atrás, esto lo solucioné con bun
  ```bash
  sudo apt update
  sudo apt install -y unzip curl
  ```

  ```bash
  curl -fsSL https://bun.sh/install | bash
  # cierra y abre la terminal o carga bun en esta sesión:
  export PATH="$HOME/.bun/bin:$PATH"
  bun -v   # debe mostrar la versión
  ```
  ```bash
  npx expo install
  ```
  ### Problema Incompatible react versions
  ```bash
  npx expo install expo@^54.0.0 --fix
  ```
  ### Problema _lruCache constructor 
  ```bash
  rm -rf node_modules
  ```
  y correr denuevo.

  <img width="643" height="84" alt="image" src="https://github.com/user-attachments/assets/613256c1-8f36-40d2-9bf2-f2fca810c088" />
  @rofernweh

  ## Problemas conocidos: 



