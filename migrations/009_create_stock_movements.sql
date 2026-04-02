CREATE TABLE bunzina.stock_movements (
  id               UUID                       PRIMARY KEY,
  auto_part_id     UUID                       NOT NULL REFERENCES bunzina.auto_parts(id),
  quantity         INTEGER                    NOT NULL CHECK (quantity > 0),
  type             bunzina.stock_movement_type NOT NULL,
  service_order_id UUID                       REFERENCES bunzina.service_orders(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ                NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stock_movements_auto_part_id     ON bunzina.stock_movements(auto_part_id);
CREATE INDEX idx_stock_movements_service_order_id ON bunzina.stock_movements(service_order_id);
