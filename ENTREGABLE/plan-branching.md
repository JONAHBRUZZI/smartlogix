# Plan de Branching (Estrategia de Ramas)

**Proyecto:** SmartLogix
**Repositorio:** https://github.com/JONAHBRUZZI/smartlogix
**Estrategia:** GitFlow (adaptado)

---

## Estrategia elegida: GitFlow

SmartLogix usa una adaptacion de **GitFlow**, adecuada para proyectos con multiples colaboradores y entregas planificadas.

### ¿Por que GitFlow?

- **Desarrollo paralelo:** Permite trabajar en funcionalidades simultaneamente sin afectar produccion.
- **Estabilidad:** `main` siempre contiene codigo probado y listo para produccion.
- **Integracion:** `develop` actua como rama de integracion donde se prueban los features antes de promocionar a produccion.
- **Trazabilidad:** Historial claro de que cambios entraron en cada release.

---

## Estructura de ramas

```
main (produccion)
  │
  └── develop (integracion)
        │
        ├── feature/nombre-descriptivo
        ├── darlette
        └── fix/nombre-del-bug
```

---

## Ramas principales

### `main`

- **Proposito:** Codigo en produccion. Solo se mergea desde `develop` o desde un `hotfix`.
- **Regla:** Nunca se hace push directo.
- **Deploy:** Vercel escucha `main` y despliega automaticamente a https://smartlogix-five.vercel.app.
- **Estado:** Siempre compila y pasa tests.

### `develop`

- **Proposito:** Rama de integracion. Todos los features se mergean aqui primero.
- **Regla:** Se crea desde `main`. Es la rama mas activa.
- **Flujo:** Los features se prueban en `develop` antes de llegar a `main`.

---

## Ramas de soporte

| Prefijo | Proposito | Se crea desde | Se mergea a | Ejemplo |
|---------|----------|---------------|-------------|---------|
| `feature/` | Nueva funcionalidad | `develop` | `develop` | `feature/order-delete` |
| `fix/` | Correccion de bug | `develop` | `develop` | `fix/null-slice-error` |
| `hotfix/` | Bug critico en prod | `main` | `main` + `develop` | `hotfix/login-crash` |
| Nombre persona | Rama personal de trabajo | `develop` | `develop` via PR | `darlette` |

---

## Flujo de trabajo paso a paso

### 1. Crear rama de feature desde develop

```bash
git checkout develop
git pull origin develop
git checkout -b feature/mi-funcionalidad
```

### 2. Desarrollar y commitear

```bash
git add -A
git commit -m "feat: descripcion breve del cambio"
git push origin feature/mi-funcionalidad
```

### 3. Crear Pull Request hacia `develop`

En GitHub, crear PR desde `feature/mi-funcionalidad` hacia `develop`.

- Vercel crea un **preview deployment** automatico
- Revisar el preview antes de mergear
- Usar **Squash and Merge** para mantener historial limpio

### 4. Promocionar a produccion (release)

Cuando `develop` esta estable y listo para produccion:

```bash
git checkout main
git pull origin main
git merge develop
git push origin main
```

Esto dispara el deploy a produccion en Vercel.

### 5. Actualizar VM del backend (si aplica)

```bash
# SSH a la VM
ssh root@104.248.60.29
cd ~/smartlogix
git pull origin main
docker compose -f docker-compose.vm.yml up -d
```

---

## Ramas activas actuales

| Rama | Autor | Estado | Proposito |
|------|-------|--------|----------|
| `main` | JONAHBRUZZI | Activa, actualizada | Produccion |
| `develop` | JONAHBRUZZI | 56 commits adelante | Integracion de features |
| `darlette` | darlmorales | 35 commits adelante, PR #2 abierto | Rama personal de trabajo |

---

## Reglas del repositorio

1. `main` siempre debe compilar (`npm run build` exitoso)
2. No hacer push directo a `main` ni a `develop`
3. Los cambios a `develop` entran via Pull Request
4. Los cambios a `main` entran via merge desde `develop`
5. Usar **Squash and Merge** para PRs
6. Borrar la rama de feature despues del merge
7. Mantener `develop` sincronizado con `main` despues de cada release

---

## Convencion de commits

Se sigue **Conventional Commits**:

```
<tipo>: <descripcion breve>
```

| Tipo | Uso |
|------|-----|
| `feat` | Nueva funcionalidad |
| `fix` | Correccion de bug |
| `docs` | Documentacion |
| `style` | Formato (sin cambio de logica) |
| `refactor` | Refactorizacion |
| `test` | Tests |
| `chore` | Build, config, dependencias |

**Ejemplos:**
```
feat: agregar endpoint DELETE para pedidos
fix: evitar error .slice() en null al cargar detalle
docs: crear README para cada microservicio
chore: eliminar archivos CloudFormation no usados
```

---

## Diagrama de flujo

```
main         ★───★──────────────────────★─── produccion
              \                         /
develop        ★──★──★──★──★──★──★──★─ integracion
                \   \      /
feature/abc     ★─★─★     /
                          /
feature/xyz             ★─★─★
```
