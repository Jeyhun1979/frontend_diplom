/**
 * @typedef {Object} Payment
 * @property {number} id - ID платежа
 * @property {number} amount - Сумма
 * @property {string} status - Статус
 * @property {string} method - Способ оплаты
 * @property {string} createdAt - Дата создания
 */

/**
 * @typedef {Object} Order
 * @property {number} id - ID заказа
 * @property {Ticket} ticket - Билет
 * @property {number[]} seats - Места
 * @property {Passenger[]} passengers - Пассажиры
 * @property {Payment} payment - Платеж
 * @property {string} status - Статус заказа
 */
