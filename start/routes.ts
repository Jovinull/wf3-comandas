import router from '@adonisjs/core/services/router'

import AuthController from '#controllers/http/auth_controller'

import OperationalWaitersController from '#controllers/http/operational/operational_waiters_controller'
import MenuController from '#controllers/http/operational/menu_controller'
import OverviewController from '#controllers/http/operational/overview_controller'
import DayComandasController from '#controllers/http/operational/day_comandas_controller'
import OrdersController from '#controllers/http/operational/orders_controller'
import ComandasController from '#controllers/http/operational/comandas_controller'
import PrintJobsController from '#controllers/http/operational/print_jobs_controller'

import AdminWaitersController from '#controllers/http/admin/waiters_controller'
import AdminTablesController from '#controllers/http/admin/tables_controller'
import AdminCategoriesController from '#controllers/http/admin/categories_controller'
import AdminProductsController from '#controllers/http/admin/products_controller'
import AdminMetricsController from '#controllers/http/admin/metrics_controller'

router.group(() => {
  // Auth
  router.post('/auth/login', [AuthController, 'login'])
  router.get('/auth/me', [AuthController, 'me']).middleware(['authJwt', 'tenant'])
  router.post('/auth/logout', [AuthController, 'logout']).middleware(['authJwt', 'tenant'])

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
    .middleware(['authJwt', 'tenant', 'role:MANAGER,WAITER'])

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
    .middleware(['authJwt', 'tenant', 'role:MANAGER'])
}).prefix('/api')
