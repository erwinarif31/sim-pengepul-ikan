CREATE TABLE harvests (
    id UUID PRIMARY KEY,
    harvest_date DATE NOT NULL,
    weight DECIMAL NOT NULL,
    price INT NOT NULL,
    bagang_id UUID NOT NULL,
    FOREIGN KEY (bagang_id) REFERENCES bagang (id)
);
