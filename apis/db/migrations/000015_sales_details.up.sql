CREATE TABLE sales_details(
    id SERIAL PRIMARY KEY,
    sales_id integer NOT NULL,
    harvest_types varchar(255) NOT NULL,
    weight integer NOT NULL,
    price integer NOT NULL,
    FOREIGN KEY (sales_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (harvest_types) REFERENCES harvest_types(name) ON DELETE CASCADE
);
