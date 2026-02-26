# Manual de Contribución

Este manual marca ciertas pautas a seguir a la hora de contribuir en los repositorios de Github del proyecto (ya sea haciendo commits, creando issues, etc.). No es necesario seguir este manual al pie de la letra, pero conviene tener unas guías para que a la hora de trabajar sigamos un estándar común y nos sirva para tener todo mejor organizado.

## Commits

Los mensajes de commit debería de seguir el siguiente formato:
```
\<tipo\>: \<Título de commit\>  
\[Comentarios del commit\]
```

En `\<tipo\>`, se puede poner una de las 3 elementos

- **Fix**: Arreglo de un error o fallo  
- **Feat:** Una nueva funcionalidad del sistema  
- **IMP:** Cualquier tipo de cambio importante, esto suelen ser cualquier cambio que afecta a otro módulo del sistema

En cuanto al título del commit, debe ser lo suficientemente descriptivo para que leyéndola se puede saber que se ha hecho en ese commit (No hagáis commits con títulos “Cambiado una cosilla” o “aaaa” por favor, que no cuesta nada escribir una línea, no pedimos más). En cuanto a los comentarios, esto no es obligatorio, pero si recomendable si en el comité se han hecho muchas cosas y así tener un desglose de las cosas añadidas o modificadas.

## Ramas y Pull Requests

La rama **main** está protegida y no podéis hacer commits directamente a ella. Teneis que crear ramas para ir trabajando en los módulos. Las ramas pueden tener cualquier nombre y en ellas podéis hacer commit a ellas sin restricciones. 

En las ramas cuando tengáis una funcionalidad hecha y completa, podéis hacer un pull request de la rama a **main.** Esto es esencialmente una petición para hacer un merge de la rama que estabais trabajando a la rama **main.** En ese pull request tendréis que poner un título y una descripción de lo que se ha hecho.

Una vez hecho el pull request, para que se puede hacer merge de esta, es necesario que **al menos** **una persona diferente a la que ha iniciado el pull request lo apruebe**. Esto es para que otra persona pueda comprobar el código y que así no se escapen errores. Para aprobar (o comentar) un pull request, primero tienes que ir al repositorio \> pull request \> seleccionar el pull request \> seleccionar la pestaña “Files changed” \> Botón “submit review”

![][image1]  
![][image2]

Aquí podéis comentar algo sobre la pull request, dar el ok o solicitar cambios a ella. Si se ha aprobado, entonces se puede hacer el merge del pull request. También se puede cerrar la pull request y rechazar así el merge. En estos casos, es muy aconsejable decir porque se ha cerrado.

En un pull request, se puede añadir cosas como “Reviewers” (gente que está comprobando la pull request o quieres que compruebe), etiquetas, “development” (para asignar issues a la pull request) y **milestones.** Esta última es muy aconsejable ponerla para así organizarnos los que se ha hecho en un hito en específico

## Issues

Las issues se usarán para poner fallos que se han detectado en algo, elementos o tareas que hay que hacer en el sistema. Una issue debe tener un título que resuma lo que hay que hacer y en la descripción una descripción más detallada de la tarea. También se puede asignar a personas a una issue, poner etiquetas, **tipo de issue** (obligatoria ponerla) y asignarla a un **milestone o hito** (también obligatoria). Se puede comentar en la issue para preguntar o comentar sobre diferentes cosas relacionadas a esta. Las issues se pueden mencionar en commits o pull requests. Una vez terminada la tarea, se debe de cerrar la issue.  
