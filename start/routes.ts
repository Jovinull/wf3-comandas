// start/routes.ts
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Lazy controller imports (exigido pelo eslint @adonisjs/prefer-lazy-controller-import)
const AuthController = () => import('#controllers/http/auth_controller')

const OperationalWaitersController = () =>
  import('#controllers/http/operational/operational_waiters_controller')
const MenuController = () => import('#controllers/http/operational/menu_controller')
const OverviewController = () => import('#controllers/http/operational/overview_controller')
const DayComandasController = () => import('#controllers/http/operational/day_comandas_controller')
const OrdersController = () => import('#controllers/http/operational/orders_controller')
const ComandasController = () => import('#controllers/http/operational/comandas_controller')
const PrintJobsController = () => import('#controllers/http/operational/print_jobs_controller')

const AdminWaitersController = () => import('#controllers/http/admin/waiters_controller')
const AdminTablesController = () => import('#controllers/http/admin/tables_controller')
const AdminCategoriesController = () => import('#controllers/http/admin/categories_controller')
const AdminProductsController = () => import('#controllers/http/admin/products_controller')
const AdminMetricsController = () => import('#controllers/http/admin/metrics_controller')

router
  .group(() => {
    // Auth
    router.post('/auth/login', [AuthController, 'login'])
    router
      .get('/auth/me', [AuthController, 'me'])
      .middleware([middleware.authJwt(), middleware.tenant()])
    router
      .post('/auth/logout', [AuthController, 'logout'])
      .middleware([middleware.authJwt(), middleware.tenant()])

    // Operational (MANAGER ou WAITER)
    router
      .group(() => {
        router.get('/waiters', [OperationalWaitersController, 'index'])
        router.get('/menu', [MenuController, 'index'])
        router.get('/overview', [OverviewController, 'index'])
        router.get('/day/comandas', [DayComandasController, 'index'])

        router.post('/tables/:tableId/orders', [OrdersController, 'store'])

        router.get('/comandas/:id', [ComandasController, 'show'])
        router.post('/comandas/:id/close', [ComandasController, 'close'])

        router.get('/print-jobs/pending', [PrintJobsController, 'pending'])
        router.post('/print-jobs/:id/printed', [PrintJobsController, 'markPrinted'])
      })
      .prefix('/operational')
      .middleware([
        middleware.authJwt(),
        middleware.tenant(),
        middleware.role(['MANAGER', 'WAITER']),
      ])

    // Admin (MANAGER)
    router
      .group(() => {
        router.get('/waiters', [AdminWaitersController, 'index'])
        router.post('/waiters', [AdminWaitersController, 'store'])
        router.get('/waiters/:id', [AdminWaitersController, 'show'])
        router.put('/waiters/:id', [AdminWaitersController, 'update'])
        router.delete('/waiters/:id', [AdminWaitersController, 'destroy'])

        router.get('/tables', [AdminTablesController, 'index'])
        router.post('/tables', [AdminTablesController, 'store'])
        router.get('/tables/:id', [AdminTablesController, 'show'])
        router.put('/tables/:id', [AdminTablesController, 'update'])
        router.delete('/tables/:id', [AdminTablesController, 'destroy'])

        router.get('/categories', [AdminCategoriesController, 'index'])
        router.post('/categories', [AdminCategoriesController, 'store'])
        router.get('/categories/:id', [AdminCategoriesController, 'show'])
        router.put('/categories/:id', [AdminCategoriesController, 'update'])
        router.delete('/categories/:id', [AdminCategoriesController, 'destroy'])

        router.get('/products', [AdminProductsController, 'index'])
        router.post('/products', [AdminProductsController, 'store'])
        router.get('/products/:id', [AdminProductsController, 'show'])
        router.put('/products/:id', [AdminProductsController, 'update'])
        router.delete('/products/:id', [AdminProductsController, 'destroy'])

        router.get('/metrics/summary', [AdminMetricsController, 'summary'])
        router.get('/metrics/top-products', [AdminMetricsController, 'topProducts'])
        router.get('/metrics/by-hour', [AdminMetricsController, 'byHour'])
        router.get('/metrics/by-waiter', [AdminMetricsController, 'byWaiter'])
      })
      .prefix('/admin')
      .middleware([middleware.authJwt(), middleware.tenant(), middleware.role(['MANAGER'])])
  })
  .prefix('/api')
