CREATE TABLE transaction_details(
    id SERIAL PRIMARY KEY,
    sales_id integer NOT NULL,
    amount integer NOT NULL,
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sales_id) REFERENCES sales(id) ON DELETE CASCADE
);
