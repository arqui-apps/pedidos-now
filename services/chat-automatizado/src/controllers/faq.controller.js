import pool from '../config/database.js';

const CATEGORY_TYPES = [
  'cliente',
  'repartidor',
  'restaurante',
  'farmacia',
  'supermercado',
  'paqueteria',
];

const FAQ_STATUSES = ['active', 'inactive', 'archive'];

const FAQ_SELECT = `
  SELECT
    id_faq,
    category_type,
    question,
    answer,
    faq_status,
    created_date,
    update_date
  FROM faq_design
`;

const parsePositiveInt = (value, fallback = 1) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed <= 0 ? fallback : parsed;
};

export const getFaqs = async (req, res) => {
  try {
    const {
      category_type,
      faq_status,
      search = '',
      page = '1',
      limit = '10',
      include_inactive = 'false',
    } = req.query;

    if (category_type && !CATEGORY_TYPES.includes(category_type)) {
      return res.status(400).json({
        message: 'category_type inválido',
        allowedValues: CATEGORY_TYPES,
      });
    }

    if (faq_status && !FAQ_STATUSES.includes(faq_status)) {
      return res.status(400).json({
        message: 'faq_status inválido',
        allowedValues: FAQ_STATUSES,
      });
    }

    const pageNumber = parsePositiveInt(page, 1);
    const limitNumber = Math.min(parsePositiveInt(limit, 10), 100);
    const offset = (pageNumber - 1) * limitNumber;
    const includeInactive = include_inactive === 'true';

    const whereClauses = [];
    const params = [];

    if (category_type) {
      whereClauses.push('category_type = ?');
      params.push(category_type);
    }

    if (!includeInactive) {
      whereClauses.push('faq_status = ?');
      params.push('active');
    } else if (faq_status) {
      whereClauses.push('faq_status = ?');
      params.push(faq_status);
    }

    if (search.trim()) {
      whereClauses.push('(question LIKE ? OR answer LIKE ?)');
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    const whereSql = whereClauses.length
      ? `WHERE ${whereClauses.join(' AND ')}`
      : '';

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM faq_design ${whereSql}`,
      params,
    );

    const total = countRows[0].total;

    const [rows] = await pool.query(
      `
        ${FAQ_SELECT}
        ${whereSql}
        ORDER BY id_faq DESC
        LIMIT ? OFFSET ?
      `,
      [...params, limitNumber, offset],
    );

    return res.status(200).json({
      message: 'FAQs obtenidas correctamente',
      data: rows,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error('getFaqs error:', error);
    return res.status(500).json({
      message: 'Error interno del servidor al obtener las FAQs',
    });
  }
};

export const getFaqById = async (req, res) => {
  try {
    const idFaq = parsePositiveInt(req.params.id, 0);
    const includeInactive = req.query.include_inactive === 'true';

    if (!idFaq) {
      return res.status(400).json({
        message: 'id inválido',
      });
    }

    let sql = `${FAQ_SELECT} WHERE id_faq = ?`;
    const params = [idFaq];

    if (!includeInactive) {
      sql += ' AND faq_status = ?';
      params.push('active');
    }

    sql += ' LIMIT 1';

    const [rows] = await pool.query(sql, params);

    if (!rows.length) {
      return res.status(404).json({
        message: 'FAQ no encontrada',
      });
    }

    return res.status(200).json({
      message: 'FAQ obtenida correctamente',
      data: rows[0],
    });
  } catch (error) {
    console.error('getFaqById error:', error);
    return res.status(500).json({
      message: 'Error interno del servidor al obtener la FAQ',
    });
  }
};

export const createFaq = async (req, res) => {
  try {
    const { category_type, question, answer, faq_status = 'active' } = req.body;

    if (!category_type || !question || !answer) {
      return res.status(400).json({
        message: 'category_type, question y answer son obligatorios',
      });
    }

    if (!CATEGORY_TYPES.includes(category_type)) {
      return res.status(400).json({
        message: 'category_type inválido',
        allowedValues: CATEGORY_TYPES,
      });
    }

    if (!FAQ_STATUSES.includes(faq_status)) {
      return res.status(400).json({
        message: 'faq_status inválido',
        allowedValues: FAQ_STATUSES,
      });
    }

    const cleanQuestion = String(question).trim();
    const cleanAnswer = String(answer).trim();

    if (!cleanQuestion || !cleanAnswer) {
      return res.status(400).json({
        message: 'question y answer no pueden ir vacíos',
      });
    }

    const [result] = await pool.query(
      `
        INSERT INTO faq_design (
          category_type,
          question,
          answer,
          faq_status
        )
        VALUES (?, ?, ?, ?)
      `,
      [category_type, cleanQuestion, cleanAnswer, faq_status],
    );

    const [rows] = await pool.query(`${FAQ_SELECT} WHERE id_faq = ? LIMIT 1`, [
      result.insertId,
    ]);

    return res.status(201).json({
      message: 'FAQ creada correctamente',
      data: rows[0],
    });
  } catch (error) {
    console.error('createFaq error:', error);
    return res.status(500).json({
      message: 'Error interno del servidor al crear la FAQ',
    });
  }
};

export const updateFaq = async (req, res) => {
  try {
    const idFaq = parsePositiveInt(req.params.id, 0);

    if (!idFaq) {
      return res.status(400).json({
        message: 'id inválido',
      });
    }

    const { category_type, question, answer, faq_status } = req.body;

    const fields = [];
    const values = [];

    if (typeof category_type !== 'undefined') {
      if (!CATEGORY_TYPES.includes(category_type)) {
        return res.status(400).json({
          message: 'category_type inválido',
          allowedValues: CATEGORY_TYPES,
        });
      }

      fields.push('category_type = ?');
      values.push(category_type);
    }

    if (typeof question !== 'undefined') {
      const cleanQuestion = String(question).trim();

      if (!cleanQuestion) {
        return res.status(400).json({
          message: 'question no puede ir vacío',
        });
      }

      fields.push('question = ?');
      values.push(cleanQuestion);
    }

    if (typeof answer !== 'undefined') {
      const cleanAnswer = String(answer).trim();

      if (!cleanAnswer) {
        return res.status(400).json({
          message: 'answer no puede ir vacío',
        });
      }

      fields.push('answer = ?');
      values.push(cleanAnswer);
    }

    if (typeof faq_status !== 'undefined') {
      if (!FAQ_STATUSES.includes(faq_status)) {
        return res.status(400).json({
          message: 'faq_status inválido',
          allowedValues: FAQ_STATUSES,
        });
      }

      fields.push('faq_status = ?');
      values.push(faq_status);
    }

    if (!fields.length) {
      return res.status(400).json({
        message: 'No hay campos para actualizar',
      });
    }

    const [existingRows] = await pool.query(
      `
        SELECT id_faq
        FROM faq_design
        WHERE id_faq = ?
        LIMIT 1
      `,
      [idFaq],
    );

    if (!existingRows.length) {
      return res.status(404).json({
        message: 'FAQ no encontrada',
      });
    }

    values.push(idFaq);

    await pool.query(
      `
        UPDATE faq_design
        SET ${fields.join(', ')}
        WHERE id_faq = ?
      `,
      values,
    );

    const [rows] = await pool.query(`${FAQ_SELECT} WHERE id_faq = ? LIMIT 1`, [
      idFaq,
    ]);

    return res.status(200).json({
      message: 'FAQ actualizada correctamente',
      data: rows[0],
    });
  } catch (error) {
    console.error('updateFaq error:', error);
    return res.status(500).json({
      message: 'Error interno del servidor al actualizar la FAQ',
    });
  }
};

export const deleteFaq = async (req, res) => {
  try {
    const idFaq = parsePositiveInt(req.params.id, 0);

    if (!idFaq) {
      return res.status(400).json({
        message: 'id inválido',
      });
    }

    const [result] = await pool.query(
      `
        UPDATE faq_design
        SET faq_status = 'inactive'
        WHERE id_faq = ?
          AND faq_status <> 'inactive'
      `,
      [idFaq],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'FAQ no encontrada o ya inactiva',
      });
    }

    return res.status(200).json({
      message: 'FAQ desactivada correctamente',
    });
  } catch (error) {
    console.error('deleteFaq error:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
    });
  }
};