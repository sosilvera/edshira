@echo off
echo Iniciando el servidor...

echo Activando el entorno virtual...
call env\Scripts\activate

echo Iniciando el servidor con uvicorn...
cd src
uvicorn main:app --reload --host 0.0.0.0 --port 30095

echo Servidor iniciado.
