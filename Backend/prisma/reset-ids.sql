-- Reset de la secuencia de IDs de la tabla Motorcycle
DELETE FROM "Motorcycle" WHERE source = 'seed';
ALTER SEQUENCE "Motorcycle_id_seq" RESTART WITH 1;
