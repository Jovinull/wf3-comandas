import { BaseSeeder } from '@adonisjs/lucid/seeders'
import env from '#start/env'
import hash from '@adonisjs/core/services/hash'

import Restaurant from '#models/restaurant'
import User from '#models/user'
import Waiter from '#models/waiter'
import Table from '#models/table'
import Category from '#models/category'
import Product from '#models/product'
import { UserRole } from '#utils/enums'

export default class Wf3ComandasSeeder extends BaseSeeder {
  public async run() {
    const passwordHash = '12345678'

    // Restaurants
    const r1 = await Restaurant.firstOrCreate(
      { slug: 'restaurant1' },
      { name: 'Restaurante 1', slug: 'restaurant1' }
    )

    const r2 = await Restaurant.firstOrCreate(
      { slug: 'restaurant2' },
      { name: 'Restaurante 2', slug: 'restaurant2' }
    )

    // Users (1 manager + 1 waiter user) por restaurante
    await User.firstOrCreate(
      { restaurantId: r1.id, email: 'gestor@restaurante1.com' },
      {
        restaurantId: r1.id,
        email: 'gestor@restaurante1.com',
        role: UserRole.MANAGER,
        passwordHash,
        isActive: true,
      }
    )

    await User.firstOrCreate(
      { restaurantId: r1.id, email: 'garcom@restaurante1.com' },
      {
        restaurantId: r1.id,
        email: 'garcom@restaurante1.com',
        role: UserRole.WAITER,
        passwordHash,
        isActive: true,
      }
    )

    await User.firstOrCreate(
      { restaurantId: r2.id, email: 'gestor@restaurante2.com' },
      {
        restaurantId: r2.id,
        email: 'gestor@restaurante2.com',
        role: UserRole.MANAGER,
        passwordHash,
        isActive: true,
      }
    )

    await User.firstOrCreate(
      { restaurantId: r2.id, email: 'garcom@restaurante2.com' },
      {
        restaurantId: r2.id,
        email: 'garcom@restaurante2.com',
        role: UserRole.WAITER,
        passwordHash,
        isActive: true,
      }
    )

    // Waiters operacionais
    const waiterNames = ['João', 'Maria']
    for (const name of waiterNames) {
      await Waiter.firstOrCreate(
        { restaurantId: r1.id, name },
        { restaurantId: r1.id, name, isActive: true }
      )
      await Waiter.firstOrCreate(
        { restaurantId: r2.id, name },
        { restaurantId: r2.id, name, isActive: true }
      )
    }

    // Tables 1..10
    for (let i = 1; i <= 10; i++) {
      await Table.firstOrCreate(
        { restaurantId: r1.id, name: String(i) },
        { restaurantId: r1.id, name: String(i), description: null, isActive: true }
      )
      await Table.firstOrCreate(
        { restaurantId: r2.id, name: String(i) },
        { restaurantId: r2.id, name: String(i), description: null, isActive: true }
      )
    }

    // Categories + Products iniciais
    const categories = [
      {
        name: 'Bebidas',
        products: [
          { name: 'Água', price: 3.5 },
          { name: 'Refrigerante', price: 7.0 },
        ],
      },
      {
        name: 'Lanches',
        products: [
          { name: 'Hambúrguer', price: 18.9 },
          { name: 'Batata Frita', price: 12.0 },
        ],
      },
    ]

    for (const rest of [r1, r2]) {
      for (const c of categories) {
        const category = await Category.firstOrCreate(
          { restaurantId: rest.id, name: c.name },
          { restaurantId: rest.id, name: c.name, sortOrder: null, isActive: true }
        )

        for (const p of c.products) {
          await Product.firstOrCreate(
            { restaurantId: rest.id, categoryId: category.id, name: p.name },
            {
              restaurantId: rest.id,
              categoryId: category.id,
              name: p.name,
              description: null,
              price: p.price.toFixed(2), // Lucid decimal costuma serializar como string
              imageUrl: null,
              isActive: true,
            }
          )
        }
      }
    }
  }
}
