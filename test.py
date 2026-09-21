import psycopg2

try:
    conn = psycopg2.connect("postgres://postgres:S2yGvN4M$8rP@viaduct.proxy.rlwy.net:18274/railway")
    cur = conn.cursor()
    cur.execute("SELECT nombre, \"precioCompra\", \"precioUnitario\", \"precioPublico\", \"precioVenta\", utilidad, \"aplicaIva\", iva FROM pos_productos WHERE nombre LIKE '%MIEL%'")
    rows = cur.fetchall()
    for row in rows:
        print(row)
    cur.close()
    conn.close()
except Exception as e:
    print(e)
