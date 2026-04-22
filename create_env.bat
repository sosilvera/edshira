@echo off
echo Creando el entorno virtual...
py -m venv env

echo Activando el entorno virtual...
call env\Scripts\activate

echo Instalando dependencias...
pip install -r requirements.txt

echo Listo. Entorno virtual creado e instaladas las dependencias.
