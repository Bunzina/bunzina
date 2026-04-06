CREATE TABLE bunzina.service_order_service_items (
  id               UUID           PRIMARY KEY,
  service_order_id UUID           NOT NULL REFERENCES bunzina.service_orders(id) ON DELETE CASCADE,
  service_id       UUID           NOT NULL REFERENCES bunzina.services(id),
  price            NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  description      TEXT
);

CREATE INDEX idx_so_service_items_order_id   ON bunzina.service_order_service_items(service_order_id);
CREATE INDEX idx_so_service_items_service_id ON bunzina.service_order_service_items(service_id);

CREATE TABLE bunzina.service_order_auto_part_items (
  id               UUID           PRIMARY KEY,
  service_order_id UUID           NOT NULL REFERENCES bunzina.service_orders(id) ON DELETE CASCADE,
  auto_part_id     UUID           NOT NULL REFERENCES bunzina.auto_parts(id),
  quantity         INTEGER        NOT NULL CHECK (quantity > 0),
  unit_price       NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  total_price      NUMERIC(10, 2)          CHECK (total_price >= 0),
  description      TEXT
);

CREATE INDEX idx_so_auto_part_items_order_id    ON bunzina.service_order_auto_part_items(service_order_id);
CREATE INDEX idx_so_auto_part_items_auto_part_id ON bunzina.service_order_auto_part_items(auto_part_id);
