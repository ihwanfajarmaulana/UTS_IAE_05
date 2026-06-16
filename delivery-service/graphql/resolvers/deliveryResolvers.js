const pool = require('../../db');

const validStatuses = ['pending', 'assigned', 'picked_up', 'on_the_way', 'delivered', 'failed'];

const statusInfo = {
    pending: 'Pesanan sedang menunggu kurir',
    assigned: 'Kurir sudah ditugaskan',
    picked_up: 'Pesanan sudah diambil kurir',
    on_the_way: 'Pesanan sedang dalam perjalanan',
    delivered: 'Pesanan sudah sampai tujuan',
    failed: 'Pengiriman gagal',
};

function mapDelivery(row) {
    if (!row) return null;
    return {
        ...row,
        status_description: statusInfo[row.status] || 'Status tidak diketahui',
    };
}

async function getDeliveryById(id) {
    const [rows] = await pool.query('SELECT * FROM deliveries WHERE id = ?', [id]);
    return mapDelivery(rows[0]);
}

function validateStatus(status) {
    if (!status) throw new Error('status wajib diisi');
    if (!validStatuses.includes(status)) {
        throw new Error(`Status tidak valid. Pilihan: ${validStatuses.join(', ')}`);
    }
}

const deliveryResolvers = {
    Query: {
        deliveries: async () => {
            const [rows] = await pool.query('SELECT * FROM deliveries ORDER BY id DESC');
            return rows.map(mapDelivery);
        },

        delivery: async (_, { id }) => {
            const data = await getDeliveryById(id);
            if (!data) throw new Error('Delivery tidak ditemukan');
            return data;
        },

        trackDelivery: async (_, { id }) => {
            const [rows] = await pool.query(
                'SELECT id, order_id, courier_id, status, address, recipient_name, recipient_phone, created_at, updated_at FROM deliveries WHERE id = ?',
                [id]
            );
            if (rows.length === 0) throw new Error('Data tracking tidak ditemukan');
            return mapDelivery(rows[0]);
        },

        deliveriesByCourier: async (_, { courierId }) => {
            const [rows] = await pool.query(
                'SELECT * FROM deliveries WHERE courier_id = ? ORDER BY id DESC',
                [courierId]
            );
            return rows.map(mapDelivery);
        },
    },

    Delivery: {
        __resolveReference: async (deliveryRef) => {
            return await getDeliveryById(deliveryRef.id);
        },
        order: (delivery) => ({ __typename: 'Order', id: delivery.order_id }),
    },

    Mutation: {
        createDelivery: async (_, { orderId, courierId, address, recipientName, recipientPhone }) => {
            if (!orderId) throw new Error('orderId wajib diisi');

            const status = 'pending';
            const [result] = await pool.query(
                `INSERT INTO deliveries (order_id, courier_id, status, address, recipient_name, recipient_phone)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [orderId, courierId || null, status, address || null, recipientName || null, recipientPhone || null]
            );

            const data = await getDeliveryById(result.insertId);
            return { message: 'Delivery berhasil dibuat', data };
        },

        assignCourier: async (_, { deliveryId, courierId }) => {
            if (!deliveryId || !courierId) throw new Error('deliveryId dan courierId wajib diisi');

            const existing = await getDeliveryById(deliveryId);
            if (!existing) throw new Error('Delivery tidak ditemukan');

            await pool.query(
                "UPDATE deliveries SET courier_id = ?, status = 'assigned' WHERE id = ?",
                [courierId, deliveryId]
            );

            const data = await getDeliveryById(deliveryId);
            return { message: `Kurir ${courierId} berhasil di-assign ke delivery ${deliveryId}`, data };
        },

        updateDeliveryStatus: async (_, { deliveryId, status }) => {
            validateStatus(status);

            const existing = await getDeliveryById(deliveryId);
            if (!existing) throw new Error('Delivery tidak ditemukan');

            await pool.query('UPDATE deliveries SET status = ? WHERE id = ?', [status, deliveryId]);
            const data = await getDeliveryById(deliveryId);
            return { message: `Status delivery berhasil diupdate menjadi '${status}'`, data };
        },

        updateDelivery: async (_, { id, address, recipientName, recipientPhone }) => {
            const existing = await getDeliveryById(id);
            if (!existing) throw new Error('Delivery tidak ditemukan');

            const newAddress = address !== undefined ? address : existing.address;
            const newRecipientName = recipientName !== undefined ? recipientName : existing.recipient_name;
            const newRecipientPhone = recipientPhone !== undefined ? recipientPhone : existing.recipient_phone;

            await pool.query(
                'UPDATE deliveries SET address = ?, recipient_name = ?, recipient_phone = ? WHERE id = ?',
                [newAddress, newRecipientName, newRecipientPhone, id]
            );

            const data = await getDeliveryById(id);
            return { message: 'Detail delivery berhasil diupdate', data };
        },

        completeDelivery: async (_, { id }) => {
            const existing = await getDeliveryById(id);
            if (!existing) throw new Error('Delivery tidak ditemukan');

            await pool.query("UPDATE deliveries SET status = 'delivered' WHERE id = ?", [id]);
            const data = await getDeliveryById(id);
            return { message: `Delivery ${id} berhasil diselesaikan`, data };
        },

        deleteDelivery: async (_, { id }) => {
            const existing = await getDeliveryById(id);
            if (!existing) throw new Error('Delivery tidak ditemukan');

            await pool.query('DELETE FROM deliveries WHERE id = ?', [id]);
            return { message: `Delivery dengan id ${id} berhasil dihapus`, data: existing };
        },
    },
};

module.exports = deliveryResolvers;