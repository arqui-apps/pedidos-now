-- Vista A: vista_rentas_pendientes
CREATE OR REPLACE VIEW vista_rentas_pendientes AS
SELECT
    r.rental_id,
    r.customer_id,
    r.inventory_id,
    (r.rental_date::date + f.rental_duration) AS fecha_esperada_devolucion
FROM rental r
JOIN inventory i ON r.inventory_id = i.inventory_id
JOIN film f ON i.film_id = f.film_id
WHERE r.return_date IS NULL;


-- Vista B: vista_inventario_tienda
CREATE OR REPLACE VIEW vista_inventario_tienda AS
SELECT
    i.inventory_id,
    i.film_id,
    f.title,
    i.store_id,
    f.rental_rate
FROM inventory i
JOIN film f ON i.film_id = f.film_id;


-- Ejercicio 1: fn_obtener_precio_base(p_inventory_id INTEGER)
CREATE OR REPLACE FUNCTION fn_obtener_precio_base(p_inventory_id INTEGER)
RETURNS NUMERIC AS
$$
DECLARE
    v_precio NUMERIC;
BEGIN
    SELECT rental_rate
    INTO v_precio
    FROM vista_inventario_tienda
    WHERE inventory_id = p_inventory_id;

    RETURN COALESCE(v_precio, 0);
END;
$$
LANGUAGE plpgsql;


-- Ejercicio 2: fn_calcular_dias_retraso(p_rental_id INTEGER)
CREATE OR REPLACE FUNCTION fn_calcular_dias_retraso(p_rental_id INTEGER)
RETURNS INTEGER AS
$$
DECLARE
    v_fecha_esperada DATE;
    v_dias_retraso INTEGER;
BEGIN
    SELECT fecha_esperada_devolucion
    INTO v_fecha_esperada
    FROM vista_rentas_pendientes
    WHERE rental_id = p_rental_id;

    IF v_fecha_esperada IS NULL THEN
        RETURN 0;
    END IF;

    v_dias_retraso := CURRENT_DATE - v_fecha_esperada;

    RETURN GREATEST(v_dias_retraso, 0);
END;
$$
LANGUAGE plpgsql;


-- Ejercicio 3: fn_calcular_multa(p_dias_retraso INTEGER)
CREATE OR REPLACE FUNCTION fn_calcular_multa(p_dias_retraso INTEGER)
RETURNS NUMERIC AS
$$
BEGIN
    RETURN GREATEST(p_dias_retraso, 0) * 1.50;
END;
$$
LANGUAGE plpgsql;


-- Ejercicio 4: fn_deuda_total_renta(p_rental_id INTEGER)
CREATE OR REPLACE FUNCTION fn_deuda_total_renta(p_rental_id INTEGER)
RETURNS NUMERIC AS
$$
DECLARE
    v_inventory_id INTEGER;
    v_precio_base NUMERIC;
    v_dias_retraso INTEGER;
    v_multa NUMERIC;
BEGIN
    SELECT inventory_id
    INTO v_inventory_id
    FROM rental
    WHERE rental_id = p_rental_id;

    v_precio_base := fn_obtener_precio_base(v_inventory_id);
    v_dias_retraso := fn_calcular_dias_retraso(p_rental_id);
    v_multa := fn_calcular_multa(v_dias_retraso);

    RETURN COALESCE(v_precio_base, 0) + COALESCE(v_multa, 0);
END;
$$
LANGUAGE plpgsql;


-- Ejercicio 5: fn_cliente_tiene_moras(p_customer_id INTEGER)
CREATE OR REPLACE FUNCTION fn_cliente_tiene_moras(p_customer_id INTEGER)
RETURNS BOOLEAN AS
$$
DECLARE
    v_existe BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM vista_rentas_pendientes
        WHERE customer_id = p_customer_id
          AND fecha_esperada_devolucion < CURRENT_DATE
    )
    INTO v_existe;

    RETURN v_existe;
END;
$$
LANGUAGE plpgsql;


-- Ejercicio 6: fn_contar_copias_disponibles(p_film_id INTEGER, p_store_id INTEGER)
CREATE OR REPLACE FUNCTION fn_contar_copias_disponibles(p_film_id INTEGER, p_store_id INTEGER)
RETURNS INTEGER AS
$$
DECLARE
    v_copias_disponibles INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO v_copias_disponibles
    FROM vista_inventario_tienda vit
    WHERE vit.film_id = p_film_id
      AND vit.store_id = p_store_id
      AND vit.inventory_id NOT IN (
          SELECT r.inventory_id
          FROM rental r
          WHERE r.return_date IS NULL
      );

    RETURN v_copias_disponibles;
END;
$$
LANGUAGE plpgsql;


-- Ejercicio 7: fn_autorizar_nuevo_alquiler(p_customer_id INTEGER, p_film_id INTEGER, p_store_id INTEGER)
CREATE OR REPLACE FUNCTION fn_autorizar_nuevo_alquiler(p_customer_id INTEGER, p_film_id INTEGER, p_store_id INTEGER)
RETURNS VARCHAR AS
$$
BEGIN
    IF fn_cliente_tiene_moras(p_customer_id) THEN
        RETURN 'Denegado: El cliente tiene devoluciones pendientes.';
    END IF;

    IF fn_contar_copias_disponibles(p_film_id, p_store_id) = 0 THEN
        RETURN 'Denegado: No hay stock disponible en esta tienda.';
    END IF;

    RETURN 'Autorizado: Procesar alquiler.';
END;
$$
LANGUAGE plpgsql;


-- Ejercicio 8: fn_ingresos_totales_categoria(p_nombre_categoria VARCHAR)
CREATE OR REPLACE FUNCTION fn_ingresos_totales_categoria(p_nombre_categoria VARCHAR)
RETURNS NUMERIC AS
$$
DECLARE
    v_total NUMERIC;
BEGIN
    SELECT total_sales
    INTO v_total
    FROM sales_by_film_category
    WHERE category ILIKE p_nombre_categoria;

    RETURN COALESCE(v_total, 0);
END;
$$
LANGUAGE plpgsql;


-- Ejercicio 9: fn_clasificar_rendimiento_categoria(p_nombre_categoria VARCHAR)
CREATE OR REPLACE FUNCTION fn_clasificar_rendimiento_categoria(p_nombre_categoria VARCHAR)
RETURNS VARCHAR AS
$$
DECLARE
    v_ingresos NUMERIC;
BEGIN
    v_ingresos := fn_ingresos_totales_categoria(p_nombre_categoria);

    IF v_ingresos > 3000 THEN
        RETURN 'Excelente - Prioridad de Compra';
    ELSIF v_ingresos >= 1000 AND v_ingresos <= 3000 THEN
        RETURN 'Estable - Mantener catálogo';
    ELSE
        RETURN 'Bajo - No invertir';
    END IF;
END;
$$
LANGUAGE plpgsql;


-- Ejercicio 10: fn_auditoria_proyeccion_multas_tienda(p_store_id INTEGER)
CREATE OR REPLACE FUNCTION fn_auditoria_proyeccion_multas_tienda(p_store_id INTEGER)
RETURNS NUMERIC AS
$$
DECLARE
    v_total NUMERIC;
BEGIN
    SELECT COALESCE(SUM(fn_deuda_total_renta(vrp.rental_id)), 0)
    INTO v_total
    FROM vista_rentas_pendientes vrp
    JOIN customer c ON vrp.customer_id = c.customer_id
    WHERE c.store_id = p_store_id
      AND vrp.fecha_esperada_devolucion < CURRENT_DATE;

    RETURN v_total;
END;
$$
LANGUAGE plpgsql;